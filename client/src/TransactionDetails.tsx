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

const calculateTaxLiability = (
    transactions: Transaction[],
    taxAuthorities: TaxAuthority[]
): { state: string, taxableAmount: number, tax: number }[] => {
    const taxDetails: { state: string, taxableAmount: number, tax: number }[] = [];

    transactions.forEach(transaction => {
        const state = transaction.address.state;
        const taxAuthority = taxAuthorities.find(authority => authority.name.includes(state.toLowerCase()));

        if (taxAuthority) {
            transaction.line_items.forEach(item => {
                if (taxAuthority.taxable_items.includes(item.name)) {
                    const price = item.price * item.quantity;
                    const discount = item.discount_type === 'amount' ? item.discount || 0 : price * ((item.discount || 0) / 100);
                    const taxableAmount = price - discount;
                    const tax = taxableAmount * (taxAuthority.rate / 100);

                    taxDetails.push({ state, taxableAmount, tax });
                }
            });
        }
    });

    return taxDetails;
};

const TransactionDetails: React.FC = () => {
    const [taxDetails, setTaxDetails] = useState<{ state: string, taxableAmount: number, tax: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<ApiResponse>('/api/transactions');
                const { transactions, tax_authority } = response.data;

                const calculatedTaxDetails = calculateTaxLiability(transactions, tax_authority);
                setTaxDetails(calculatedTaxDetails);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Transaction</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>State</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Taxable Amount</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Tax</th>
                    </tr>
                </thead>
                <tbody>
                    {taxDetails.map((detail, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Transaction {index + 1}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{detail.state}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{detail.taxableAmount.toFixed(2)}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{detail.tax.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionDetails;
