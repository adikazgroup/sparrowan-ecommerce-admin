"use client";

const RecentTransactions = ({ transactions }) => {
  return (
    <div className="bg-white dark:bg-transparent dark:border-[#334155] rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#334155]">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
      </div>

      <div className="overflow-x-auto 2xl:overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[#334155]">
          <thead className="bg-gray-50 dark:bg-transparent">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs whitespace-nowrap font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Advertiser Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-200 dark:divide-[#334155]">
            {transactions.map((transaction, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 dark:hover:bg-[#161F2D]"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400">
                  {transaction.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400">
                  {transaction.advertiserName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-400">
                  {transaction.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
