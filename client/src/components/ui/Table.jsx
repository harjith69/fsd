import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  page = 1,
  totalPages = 1,
  total = 0,
  onPageChange,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#4A5170]">
          <thead className="bg-[#F7F8FC] border-b border-[#ECEEF7] text-xs font-semibold text-[#8A91AD] uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-6 py-3.5 ${col.headerClassName || ''}`}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECEEF7]">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-[#ECEEF7] rounded-full w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-[#8A91AD]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row._id || row.id || rIdx}
                  className="hover:bg-[#F9FAFF] transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.key || cIdx}
                      className={`px-6 py-4 whitespace-nowrap ${
                        col.cellClassName || ''
                      }`}
                    >
                      {col.render ? col.render(row, rIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="px-6 py-4 border-t border-[#ECEEF7] flex items-center justify-between gap-4">
          <span className="text-xs text-[#8A91AD]">
            Showing page <span className="font-semibold text-[#1B2140]">{page}</span> of{' '}
            <span className="font-semibold text-[#1B2140]">{totalPages}</span>
            {total ? ` (${total} total records)` : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
