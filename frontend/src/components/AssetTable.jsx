import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FiChevronDown } from 'react-icons/fi'

function InnerDiv({asset}){
    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 space-y-1"
        >
            <strong>Name: </strong><p>{asset.Name || '—'}</p>
            <strong>Description: </strong><p>{asset.Description || '—'}</p>
            <strong>Parent ID: </strong><p>{asset.ParentID || '—'}</p>
            <strong>Tags:</strong><p>{asset.Tags || '—'}</p>
        </motion.div>
    )
}

export default function AssetTable({ assets }) {
    const [expandedRows, setExpandedRows] = useState([]);

    const toggleRow = (id) => {
        setExpandedRows((prev) => 
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }
  return (
    <div className="overflow-x-auto p-4 w-full">
      <table className="w-full border border-club-orange-300 dark:border-club-green-500 shadow rounded-2xl overflow-hidden bg-white dark:bg-neutral-800">
        <thead className="bg-club-orange-400 dark:bg-club-green-800 text-neutral-700 dark:text-neutral-300 text-left text-sm">
          <tr>
            <th className="px-4 py-2 border-b block table-cell"></th>
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b sm:table-cell hidden">Name</th>
            <th className="px-4 py-2 border-b md:table-cell hidden">Description</th>
            <th className="px-4 py-2 border-b">Location</th>
            <th className="px-4 py-2 border-b lg:table-cell hidden">Parent</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {assets.map((asset) => {
            const isExpanded = expandedRows.includes(asset.ID)
            return (
                <React.Fragment key={asset.ID}>
                    
                    <tr key={asset.ID} className={`hover:bg-club-orange-100 hover:dark:bg-club-green-600 active:bg-club-orange-400 dark:active:bg-club-green-800 cursor-pointer text-neutral-700 dark:text-neutral-300 ${isExpanded ? 'bg-club-orange-100 dark:bg-club-green-600': ''}`} onClick={() => toggleRow(asset.ID)}>
                        <td className="px-4 py-2 border-b text-center w-8 table-cell">
                            <FiChevronDown
                                className={`transition-transform duration-300 ${
                                    isExpanded ? 'rotate-180' : ''
                                }`}
                                size={20}
                                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                            />
                        </td>
                        <td className="px-4 py-2 border-b whitespace-nowrap">{asset.ID}</td>
                        <td className="px-4 py-2 border-b w-auto break-words truncate sm:table-cell hidden">{asset.Name}</td>
                        <td className="px-4 py-2 border-b max-w-xs sm:max-w-[200px] truncate md:table-cell hidden" title={asset.Description}>
                            {asset.Description || '—'}
                        </td>
                        <td className="px-4 py-2 border-b">{asset.Location || '—'}</td>
                        <td className="px-4 py-2 border-b lg:table-cell hidden">{asset.ParentID || '—'}</td>
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
                                    <InnerDiv asset={asset}/>
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