
import React from 'react';
import { cn } from '@/lib/utils';
import { SummoCard } from './SummoCard';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface ResponsiveTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    className?: string;
}

export const ResponsiveTable = <T extends { id: string | number }>({
    data,
    columns,
    onRowClick,
    className
}: ResponsiveTableProps<T>) => {
    return (
        <div className={cn('w-full', className)}>
            {/* Desktop View */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        'px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100',
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item)}
                                className={cn(
                                    'transition-colors hover:bg-gray-50/50',
                                    onRowClick && 'cursor-pointer'
                                )}
                            >
                                {columns.map((col, idx) => (
                                    <td key={idx} className={cn('px-6 py-4 text-sm text-gray-700', col.className)}>
                                        {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {data.map((item) => (
                    <SummoCard
                        key={item.id}
                        onClick={() => onRowClick?.(item)}
                        className={cn(
                            'p-4 space-y-3',
                            onRowClick && 'cursor-pointer active:scale-95 transition-transform'
                        )}
                    >
                        {columns.map((col, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-4">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{col.header}</span>
                                <span className="text-sm font-semibold text-gray-800 text-right">
                                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                                </span>
                            </div>
                        ))}
                    </SummoCard>
                ))}
            </div>
        </div>
    );
};
