"use client";
import {
  LuEye,
  LuBadgeX,
  LuPencil,
  LuTrash2,
  LuBadgeCheck,
  LuSearch,
} from "react-icons/lu";
import {
  useDeleteCouponMutation,
  useGetCouponListQuery,
} from "@/features/coupon/couponApiSlice";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { useModal } from "@/lib/useModal";
import { handleToast } from "@/utils/handleToast";
import { Input } from "@/components/ui/input/Input";
import { Table } from "@/components/ui/table/Table";
import CouponView from "@/components/section/couponSection/CouponView";
import CouponEdit from "@/components/section/couponSection/CouponEdit";
import CouponDelete from "@/components/section/couponSection/CouponDelete";

const coupons = [
  {
    _id: "c1",
    code: "WELCOME10",
    couponType: "percentage",
    discountValue: 10,
    usageLimit: 100,
    usedCount: 24,
    status: "active",
    expiresAt: "2025-12-31T23:59:59Z",
  },
  {
    _id: "c2",
    code: "FLAT50",
    couponType: "flat",
    discountValue: 50,
    usageLimit: 50,
    usedCount: 12,
    status: "inactive",
    expiresAt: "2025-10-15T12:00:00Z",
  },
  {
    _id: "c3",
    code: "SUMMER20",
    couponType: "percentage",
    discountValue: 20,
    usageLimit: 200,
    usedCount: 199,
    status: "expired",
    expiresAt: "2024-07-01T00:00:00Z",
  },
  {
    _id: "c4",
    code: "TRAVEL75",
    couponType: "flat",
    discountValue: 75,
    usageLimit: 30,
    usedCount: 10,
    status: "active",
    expiresAt: "2025-11-20T18:30:00Z",
  },
  {
    _id: "c5",
    code: "VIPONLY25",
    couponType: "percentage",
    discountValue: 25,
    usageLimit: 300,
    usedCount: 110,
    status: "active",
    expiresAt: "2026-01-10T08:00:00Z",
  },
];

export default function CouponPage() {
  // State for selected coupon
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Coupon data
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal states
  const viewModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Action handlers
  const handleView = (row) => {
    setSelectedCoupon(row);
    viewModal.open();
  };

  const handleEdit = (row) => {
    setSelectedCoupon(row);
    editModal.open();
  };

  const handleDelete = (row) => {
    setSelectedCoupon(row);
    deleteModal.open();
  };

  // Delete Coupon
  const [deleteCoupon, { isLoading }] = useDeleteCouponMutation();

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon?._id) {
      toast.error("Coupon not selected");
      return;
    }

    const result = await deleteCoupon(selectedCoupon?._id);

    if (result?.data) {
      handleToast(result);
      deleteModal.close();
    } else {
      handleToast(result, "error");
    }
  };

  // Define columns
  const columns = [
    {
      id: "code",
      header: "Code",
      accessor: (row) => row?.code,
    },
    {
      id: "type",
      header: "Type",
      accessor: (row) => row?.couponType,
    },
    {
      id: "value",
      header: "Value",
      accessor: (row) => row?.discountValue,
    },
    {
      id: "usageLimit",
      header: "Usage Limit",
      accessor: (row) => row?.usageLimit || "N/A",
    },
    {
      id: "usedCount",
      header: "Used Count",
      accessor: (row) => row?.usedCount,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row?.status,
      cell: (value) => (
        <div className="flex items-center">
          {value === "active" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
              <LuBadgeCheck className="mr-1 h-3 w-3" />
              Active
            </span>
          )}

          {value === "inactive" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300">
              <LuBadgeX className="mr-1 h-3 w-3" />
              Inactive
            </span>
          )}

          {value === "expired" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
              <LuBadgeX className="mr-1 h-3 w-3" />
              Expired
            </span>
          )}
        </div>
      ),
    },
    {
      id: "expiresAt",
      header: "Expires At",
      accessor: (row) => moment(row?.expiresAt).format("DD MMM YYYY"),
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
              className="size-8 center text-blue-600 hover:text-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 dark:hover:text-blue-200"
              aria-label="View"
            >
              <LuEye className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              className="size-8 center text-amber-600 hover:text-amber-800 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 dark:hover:text-amber-200"
              aria-label="Edit"
            >
              <LuPencil className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="size-8 center text-destructive hover:text-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/50 dark:hover:text-red-200"
              aria-label="Delete"
            >
              <LuTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-5">
      <>
        <div className="flex items-center justify-between gap-14">
          <div className="flex items-center gap-14">
            <h1 className="text-xl font-medium ">Coupon</h1>
            <Input
              placeholder="Search coupon code"
              onChange={(e) => setSearchTerm(e.target.value)}
              endIcon={<LuSearch className="h-5 w-5" />}
              className="rounded-full sm:w-fit sm:min-w-52 bg-[#DEF4FF33] dark:bg-[#161F2D] dark:border-[#162127] px-4"
            />
          </div>
          <Link
            className="flex items-center gap-2 bg-primary hover:bg-transparent hover:text-primary border border-primary text-white px-4 py-2 text-sm rounded-full"
            href={"/coupon/create"}
          >
            Create Coupon
            <Icon icon="gridicons:create" className="h-5 w-5" />
          </Link>
        </div>
        <Table
          data={coupons}
          columns={columns}
          pagination={true}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalData={50}
          totalPages={5}
          sorting={true}
        />
      </>

      {/* View Coupon Modal */}
      <CouponView viewModal={viewModal} selectedCoupon={selectedCoupon} />

      {/* Edit Coupon Modal */}
      <CouponEdit editModal={editModal} selectedCoupon={selectedCoupon} />

      {/* Delete Confirmation Modal */}
      <CouponDelete
        deleteModal={deleteModal}
        handleDeleteCoupon={handleDeleteCoupon}
        isLoading={isLoading}
      />
    </div>
  );
}
