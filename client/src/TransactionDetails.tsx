import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LineItem {
    name: string;
    price: number;
    quantity: number;
    currency: string;
    discount?: number;
    discount_type?: 'amount' | 'percentage';
}

interface Address {
    country: string;
    city: string;
    state: string;
    street: string;
    postal_code: string;
}

interface Transaction {
    type: string;
    line_items: LineItem[];
    address: Address;
}

interface TaxAuthority {
    name: string;
    taxable_items: string[];
    rate: number;
}

interface ApiResponse {
    transactions: Transaction[];
    tax_authority: TaxAuthority[];
}

interface TransactionTaxDetails {
    state: string;
    taxableAmount: number;
    tax: number;
}

const calculateTransactionTaxDetails = (
    transaction: Transaction,
    taxAuthorities: TaxAuthority[]
): TransactionTaxDetails | null => {
    const state = transaction.address.state;
    const taxAuthority = taxAuthorities.find(authority => authority.name.includes(state.toLowerCase()));

    if (!taxAuthority) {
        return null;
    }

    let taxableAmount = 0;

    transaction.line_items.forEach(item => {
        if (taxAuthority.taxable_items.includes(item.name)) {
            const price = item.price * item.quantity;
            const discount = item.discount_type === 'amount' ? item.discount || 0 : price * ((item.discount || 0) / 100);
            taxableAmount += price - discount;
        }
    });

    const tax = taxableAmount * (taxAuthority.rate / 100);

    return {
        state,
        taxableAmount,
        tax
    };
};

const TransactionDetails: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [taxAuthorities, setTaxAuthorities] = useState<TaxAuthority[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<ApiResponse>('/api/transactions');
                const { transactions, tax_authority } = response.data;

                setTransactions(transactions);
                setTaxAuthorities(tax_authority);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {transactions.map((transaction, index) => {
                const taxDetails = calculateTransactionTaxDetails(transaction, taxAuthorities);

                if (!taxDetails) {
                    return (
                        <div key={index}>
                            <h2>Transaction {index + 1}</h2>
                            <div>No applicable tax authority found for state {transaction.address.state}</div>
                        </div>
                    );
                }

                return (
                    <div key={index}>
                        <h2>Transaction {index + 1}</h2>
                        <div>State: {taxDetails.state}</div>
                        <div>Taxable Amount: {taxDetails.taxableAmount.toFixed(2)}</div>
                        <div>Tax: {taxDetails.tax.toFixed(2)}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default TransactionDetails;
