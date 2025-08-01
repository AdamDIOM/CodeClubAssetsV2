import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { FiChevronDown } from 'react-icons/fi'

export default function AssetTable({ assets }) {
    const [expandedRows, setExpandedRows] = useState([]);

    const toggleRow = (id) => {
        setExpandedRows((prev) => 
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }
  return (
    <div className="overflow-x-auto p-4 w-full">
      <table className="w-full bg-white border border-gray-200 shadow rounded-2xl overflow-hidden">
        <thead className="bg-gray-100 text-gray-700 text-left text-sm">
          <tr>
            <th className="px-4 py-2 border-b block table-cell md:hidden"></th>
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
                    
                    <tr key={asset.ID} className="hover:bg-gray-100 cursor-pointer" onClick={() => toggleRow(asset.ID)}>
                        <td className="px-4 py-2 border-b text-center w-8 table-cell md:hidden">
                            <FiChevronDown
                                className={`transition-transform duration-300 ${
                                    isExpanded ? 'rotate-180' : ''
                                }`}
                                size={20}
                                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                            />
                        </td>
                        <td className="px-4 py-2 border-b whitespace-nowrap">{asset.ID}</td>
                        <td className="px-4 py-2 border-b sm:table-cell hidden">{asset.Name}</td>
                        <td className="px-4 py-2 border-b max-w-xs truncate md:table-cell hidden" title={asset.Description}>
                            {asset.Description || '—'}
                        </td>
                        <td className="px-4 py-2 border-b">{asset.Location || '—'}</td>
                        <td className="px-4 py-2 border-b lg:table-cell hidden">{asset.ParentID || '—'}</td>
                        </tr>
                        {/* Expandable Row (small screens only) */}
                        <AnimatePresence initial={false}>
                            
                        {isExpanded && (
                            <tr className="md:hidden">
                                {/* <td colSpan="5" className="px-4 py-2 border-b bg-gray-50 text-gray-600">
                                    <div className="mb-1 block sm:hidden"><strong>Name:</strong> {asset.Name || '—'}</div>
                                    <div className="mb-1"><strong>Description:</strong> {asset.Description || '—'}</div>
                                    <div><strong>Parent ID:</strong> {asset.ParentID || '—'}</div>
                                </td> */}
                                <td colSpan={4} className="px-4 py-2 bg-gray-50 border-b">
                                    <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden space-y-1"
                                    >
                                    <p><strong>Description:</strong> {asset.Description || '—'}</p>
                                    <p><strong>Parent ID:</strong> {asset.ParentID || '—'}</p>
                                    <p><strong>Tags:</strong> {asset.Tags || '—'}</p>
                                    </motion.div>
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