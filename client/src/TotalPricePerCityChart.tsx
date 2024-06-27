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
): Record<string, number> => {
    const taxLiabilities: Record<string, number> = {};

    transactions.forEach(transaction => {
        const state = transaction.address.state;
        const taxAuthority = taxAuthorities.find(authority => authority.name.includes(state.toLowerCase()));

        if (taxAuthority) {
            transaction.line_items.forEach(item => {
                if (taxAuthority.taxable_items.includes(item.name)) {
                    const price = item.price * item.quantity;
                    const discount = item.discount_type === 'amount' ? item.discount || 0 : price * ((item.discount || 0) / 100);
                    const taxableAmount = price - discount;

                    if (!taxLiabilities[state]) {
                        taxLiabilities[state] = 0;
                    }

                    taxLiabilities[state] += taxableAmount * (taxAuthority.rate / 100);
                }
            });
        }
    });

    return taxLiabilities;
};

const TotalTaxLiability: React.FC = () => {
    const [taxLiabilities, setTaxLiabilities] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<ApiResponse>('/api/transactions');
                const { transactions, tax_authority } = response.data;

                const calculatedTaxLiabilities = calculateTaxLiability(transactions, tax_authority);

                setTaxLiabilities(calculatedTaxLiabilities);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {Object.entries(taxLiabilities).map(([state, liability]) => (
                <div key={state}>
                    {state}: {liability.toFixed(2)}
                </div>
            ))}
        </div>
    );
};

export default TotalTaxLiability;
