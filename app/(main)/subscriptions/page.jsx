"use client";
import { useState } from "react";
import { LuBadgeCheck, LuBadgeX, LuSearch } from "react-icons/lu";
import { Table } from "@/components/ui/table/Table";
import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import { useModal } from "@/lib/useModal";
import { useGetSubscriptionListQuery } from "@/features/subscription/subscriptionApiSlice";
import SingleSubscription from "@/components/section/subscription/SingleSubscription";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import { ErrorState } from "@/components/errors/ErrorState";

export default function SubscriptionPage() {
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // Modal state
  const viewModal = useModal();

  // Subscription data
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isError } = useGetSubscriptionListQuery({
    searchTerm,
    page,
    limit,
  });
  const subscriptions = data?.data?.data || [];
  const totalSubscriptions = data?.data?.meta?.total || 0;
  const totalPages = data?.data?.meta?.totalPage || 0;

  // Action handlers
  const handleView = (row) => {
    setSelectedSubscription(row);
    viewModal.open();
  };

  // Define columns
  const columns = [
    {
      id: "packageInfo",
      header: "Package Name",
      accessor: (row) => row?.packageName,
      minWidth: "150px",
    },
    {
      id: "userInfo",
      header: "User Email",
      accessor: (row) => row?.email,
    },
    {
      id: "networkInfo",
      header: "Network Name",
      accessor: (row) => row?.networkName,
    },
    {
      id: "pricing",
      header: "Pricing",
      accessor: (row) => `$${row?.price}`,
    },
    {
      id: "payment",
      header: "Payment",
      accessor: (row) => row?.paymentStatus,
      cell: (value) => (
        <div className="flex items-center">
          {value === "paid" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 dark:text-green-200 text-green-800">
              <LuBadgeCheck className="mr-1 h-3 w-3" />
              Paid
            </span>
          )}

          {value === "due" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200">
              <LuBadgeX className="mr-1 h-3 w-3" />
              Due
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: () => null,
      cell: (_, row) => (
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
              }}
              className="text-xs gap-1.5 py-1 px-2 center text-blue-600 font-medium hover:text-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
              aria-label="View"
            >
              View
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-5">
      {isError ? (
        <ErrorState />
      ) : isLoading ? (
        <TableSkeleton columns={columns} rowCount={limit} />
      ) : (
        <>
          <div className="flex sm:flex-row flex-col sm:items-center justify-between lg:gap-14 gap-4">
            <h1 className="text-xl font-medium">Subscription</h1>
            <Input
              placeholder="Search network"
              onChange={(e) => setSearchTerm(e.target.value)}
              endIcon={<LuSearch className="h-5 w-5" />}
              className="rounded-full sm:w-fit sm:min-w-52 bg-[#DEF4FF33] dark:bg-[#161F2D] dark:border-[#162127] px-4"
            />
          </div>
          <Table
            data={subscriptions}
            columns={columns}
            pagination={true}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalData={totalSubscriptions}
            totalPages={totalPages}
            sorting={true}
          />
        </>
      )}

      {/* Subscription View Modal */}
      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="View Subscription"
        size="xxlarge"
      >
        {selectedSubscription && (
          <SingleSubscription subscription={selectedSubscription} />
        )}
      </Modal>
    </div>
  );
}
