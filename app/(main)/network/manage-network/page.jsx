"use client";
import { useState } from "react";
import { useGetNetworksQuery } from "@/features/network/networkApiSlice";
import ManageTable from "@/components/section/networkSection/ManageTable";

const ApprovedPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading, isError } = useGetNetworksQuery({
    searchTerm,
    page,
    limit,
  });
  const networks = data?.data?.data || [];
  const totalNetwork = data?.data?.meta?.total || 0;
  const totalPages = data?.data?.meta?.totalPage || 0;

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-[#010611] minBody">
      <ManageTable
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        totalData={totalNetwork}
        totalPages={totalPages}
        data={networks}
        loading={isLoading}
        isError={isError}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
};

export default ApprovedPage;
