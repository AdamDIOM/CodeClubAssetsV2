import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FiChevronDown } from 'react-icons/fi'
import { Link } from "react-router-dom";

function InnerDiv({loan}){
    const borrowDate = new Date(loan.DateBorrowed);
    const returnDate = new Date(borrowDate);
    returnDate.setDate(borrowDate.getDate() + loan.LengthBorrowed);
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 space-y-1"
        >
            <strong>Asset: </strong><p>{loan.AssetID + ": " + loan.AssetName || '—'}</p>
            <strong>Borrower Name: </strong><p>{loan.MemberName || '—'}</p>
            <strong>Loaned Date: </strong><p>{borrowDate.toLocaleDateString() || '—'}</p>
            <strong>Return Date: </strong><p>{returnDate.toLocaleDateString() || '—'}</p>
            <strong>ID:</strong><p>{loan.ID || '—'}</p>
        </motion.div>
    )
}

export default function LoansTable({ loans, edit }) {
    const [expandedRows, setExpandedRows] = useState([]);

    const toggleRow = (id) => {
        setExpandedRows((prev) => 
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }
  return (
    <div className="overflow-x-auto p-4 w-full">
      <table className="top-40 w-full border border-club-orange-300 dark:border-club-green-500 shadow rounded-2xl overflow-hidden bg-white dark:bg-neutral-800">
        <thead className="sticky top-0 z-9 bg-club-orange-400 dark:bg-club-green-800 text-neutral-700 dark:text-neutral-300 text-left text-sm">
          <tr>
            <th className="px-4 py-2 border-b block table-cell"></th>
            <th className="px-4 py-2 border-b hidden">ID</th>
            <th className="px-4 py-2 border-b ">Asset ID</th>
            <th className="px-4 py-2 border-b lg:table-cell hidden">Asset Name</th>
            <th className="px-4 py-2 border-b md:table-cell hidden">Borrower</th>
            <th className="px-4 py-2 border-b">Status</th>
            <th className="px-4 py-2 border-b lg:table-cell hidden">Borrow Date</th>
            <th className="px-4 py-2 border-b md:table-cell hidden">Return Date</th>
            {edit && <th className="px-4 py-2 border-b sm:table-cell hidden"></th>}
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {loans.map((loan) => {
            const isExpanded = expandedRows.includes(loan.ID)

            const borrowDate = new Date(loan.DateBorrowed);
            const returnDate = new Date(borrowDate);
            returnDate.setDate(borrowDate.getDate() + loan.LengthBorrowed);
            const daysRemaining = Math.ceil((returnDate - new Date()) / 86400000)
            var status = "";
            if (daysRemaining < 0) {
                status = "Overdue";
            } else if (daysRemaining == 0) {
                status = "Due Today";
            } else if (daysRemaining < 8) {
                status = "Due Next Session";
            } else {
                status = `${daysRemaining} days remaining`;
            }

            return (
                <React.Fragment key={loan.ID}>

                    <tr key={loan.ID} className={`
                        hover:bg-club-orange-100 hover:dark:bg-club-green-600
                        active:bg-club-orange-400 dark:active:bg-club-green-800
                        cursor-pointer text-neutral-700 dark:text-neutral-300
                        ${isExpanded ? 'bg-club-orange-100 dark:bg-club-green-600': ''}
                        ${status == "Overdue" ? 'bg-red-200 dark:bg-red-900' : ''}
                        ${status == "Due Today" ? 'bg-orange-200 dark:bg-orange-800' : ''}
                        ${status == "Due Next Session" ? 'bg-yellow-100 dark:bg-yellow-700' : ''}
                        `} onClick={() => toggleRow(loan.ID)}>
                        <td className="px-4 py-2 border-b text-center w-8 table-cell">
                            <FiChevronDown
                                className={`transition-transform duration-300 ${
                                    isExpanded ? 'rotate-180' : ''
                                }`}
                                size={20}
                                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                            />
                        </td>
                        <td className="px-4 py-2 border-b whitespace-nowrap hidden">{loan.ID}</td>
                        <td className="px-4 py-2 border-b w-auto break-words truncate">{loan.AssetID}</td>
                        <td className="px-4 py-2 border-b max-w-xs sm:max-w-[200px] truncate lg:table-cell hidden" title={loan.AssetName}>
                            {loan.AssetName || '—'}
                        </td>
                        <td className="px-4 py-2 border-b md:table-cell hidden">{loan.MemberName || '—'}</td>
                        <td className="px-4 py-2 border-b ">{status}</td>
                        <td className="px-4 py-2 border-b lg:table-cell hidden">{borrowDate.toLocaleDateString() || '—'}</td>
                        <td className="px-4 py-2 border-b md:table-cell hidden">{returnDate.toLocaleDateString() || '—'}</td>
                        {edit && <td className="px-4 py-2 border-b w-auto break-words truncate sm:table-cell hidden">
                            <Link to={`${loan.ID}/edit`}>Edit</Link>
                            </td>}
                        </tr>
                        {/* Expandable Row (small screens only) */}
                        <AnimatePresence initial={false}>
                            
                        {isExpanded && (
                            <tr className="">
                                {/* <td colSpan="5" className="px-4 py-2 border-b bg-gray-50 text-gray-600">
                                    <div className="mb-1 block sm:hidden"><strong>Name:</strong> {asset.Name || '—'}</div>
                                    <div className="mb-1"><strong>Description:</strong> {asset.Description || '—'}</div>
                                    <div><strong>Parent ID:</strong> {asset.ParentID || '—'}</div>
                                </td> */}
                                <td colSpan={6} className="px-4 py-2 bg-club-orange-50 dark:bg-club-green-900 border-b text-neutral-700 dark:text-neutral-300">
                                    <InnerDiv loan={loan}/>
                                </td>
                            </tr>
                        )}

                        </AnimatePresence>
                </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}