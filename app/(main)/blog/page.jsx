"use client";
import { useState, useMemo } from "react";
import { LuSearch, LuPlus, LuEye, LuTrash2 } from "react-icons/lu";
import { Table } from "@/components/ui/table/Table";
import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import { useModal } from "@/lib/useModal";
import { LucideEdit } from "lucide-react";
import Link from "next/link";
import { Select } from "@/components/ui/select/Select";
import BlogForm from "@/components/form/BlogForm";
import { continents, mockBlogs } from "@/utils/FakeData";
import DeleteModal from "@/components/ui/modal/commonModal/DeleteModal";

export default function BlogDashboard() {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogs, setBlogs] = useState(mockBlogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [continentFilter, setContinentFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(7);
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    thumbnail: "",
    videoUrl: "",
    continent: "",
    country: "",
  });

  // Modal states using useModal hook
  const addModal = useModal();
  const viewModal = useModal();
  const editModal = useModal();

  // Filter and search blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.continent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesContinent =
        !continentFilter || blog.continent === continentFilter;
      const matchesCountry =
        !countryFilter ||
        blog.country.toLowerCase().includes(countryFilter.toLowerCase());

      return matchesSearch && matchesContinent && matchesCountry;
    });
  }, [blogs, searchTerm, continentFilter, countryFilter]);

  const totalBlogs = filteredBlogs.length;
  const totalPages = Math.ceil(totalBlogs / limit);
  const paginatedBlogs = filteredBlogs.slice((page - 1) * limit, page * limit);

  // Action handlers
  const handleView = (row) => {
    console.log("Viewing blog:", row);
    setSelectedBlog(row);
    viewModal.open();
  };

  const handleEdit = (row) => {
    console.log("Editing blog:", row);
    setSelectedBlog(row);
    setFormData({
      title: row.title,
      content: row.content,
      thumbnail: row.thumbnail,
      videoUrl: row.videoUrl,
      continent: row.continent,
      country: row.country,
    });
    editModal.open();
  };

  const handleDelete = async (row) => {
    console.log("Preparing to delete blog:", row);
    setBlogToDelete(row);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (blogToDelete) {
      console.log("Deleting blog:", blogToDelete);
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete.id));
      console.log("Blog deleted successfully");
      setBlogToDelete(null);
    }
  };
  const handleAddBlog = async () => {
    console.log("Adding new blog with data:", formData);
    const newBlog = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setBlogs([...blogs, newBlog]);
    resetForm();
    addModal.close();
    console.log("Blog added successfully:", newBlog);
  };

  const handleUpdateBlog = async () => {
    console.log("Updating blog with data:", formData);
    const updatedBlog = {
      ...selectedBlog,
      ...formData,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setBlogs(
      blogs.map((blog) => (blog.id === selectedBlog.id ? updatedBlog : blog))
    );
    resetForm();
    editModal.close();
    setSelectedBlog(null);
    console.log("Blog updated successfully:", updatedBlog);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      thumbnail: "",
      videoUrl: "",
      continent: "",
      country: "",
    });
  };

  const clearFilters = () => {
    setContinentFilter("");
    setCountryFilter("");
    setSearchTerm("");
  };

  // Define columns for Table component
  const columns = [
    {
      id: "thumbnail",
      header: "Thumbnail",
      accessor: () => null,
      cell: (value) => (
        <div className="w-20 h-15 relative rounded-md bg-gray-200"></div>
      ),
      minWidth: "100px",
    },
    {
      id: "title",
      header: "Title",
      accessor: (row) => row?.title,
      cell: (value) => (
        <div
          className="font-medium text-sm max-w-[200px] truncate"
          title={value}
        >
          {value}
        </div>
      ),
      minWidth: "150px",
    },

    {
      id: "videoUrl",
      header: "video Url",
      accessor: (row) => row?.videoUrl,
      cell: (value) => (
        <div className="text-sm font-medium ">
          <Link href={value} className="text-primary hover:text-gray-600">
            Video Url
          </Link>
        </div>
      ),
      minWidth: "120px",
    },

    {
      id: "continent",
      header: "Continent",
      accessor: (row) => row?.continent,
      cell: (value) => (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {value}
        </div>
      ),
      minWidth: "120px",
    },
    {
      id: "country",
      header: "Country",
      accessor: (row) => row?.country,
      cell: (value) => (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {value}
        </div>
      ),
      minWidth: "120px",
    },
    {
      id: "actions",
      header: "Actions",
      accessor: () => null,
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="size-10 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded flex items-center justify-center"
            aria-label="View"
          >
            <LuEye className="size-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="size-10 p-0 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 rounded flex items-center justify-center"
            aria-label="Edit"
          >
            <LucideEdit className="size-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="size-10 p-0 text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 rounded flex items-center justify-center"
            aria-label="Delete"
          >
            <LuTrash2 className="size-5" />
          </button>
        </div>
      ),
      minWidth: "120px",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-6 rounded-xl space-y-6">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between lg:gap-14 gap-4">
        <h1 className="text-xl font-medium">Blog Management</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            endIcon={<LuSearch className="h-5 w-5" />}
            className="rounded-full sm:w-fit sm:min-w-52 bg-[#DEF4FF33] dark:bg-[#161F2D] dark:border-[#162127] px-4"
          />

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="w-48">
              <Select
                options={continents}
                value={continentFilter}
                onChange={(e) => setContinentFilter(e.target.value)}
                fullWidth
                className="h-10 dark:border-[#475569]"
              />
            </div>

            <Input
              placeholder="Filter by country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-40"
            />
          </div>

          <button
            onClick={() => {
              resetForm();
              addModal.open();
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-[#3da280] focus:outline-none "
          >
            <LuPlus className="h-4 w-4" />
            Add Blog
          </button>
        </div>
      </div>

      {/* Results summary */}

      {(searchTerm || continentFilter || countryFilter) && (
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 ">
          <span>
            Showing {paginatedBlogs.length} of {totalBlogs} blogs
            {(searchTerm || continentFilter || countryFilter) && " (filtered)"}
          </span>

          <button
            onClick={clearFilters}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Clear filters
          </button>
        </div>
      )}

      <Table
        data={paginatedBlogs}
        columns={columns}
        pagination={true}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        totalData={totalBlogs}
        totalPages={totalPages}
        sorting={true}
      />

      {/* Add Blog Modal */}
      <Modal
        open={addModal.isOpen}
        onClose={addModal.close}
        title="Add New Blog"
        size="xxlarge"
      >
        <BlogForm
          onSubmit={handleAddBlog}
          submitText="Add Blog"
          onCancel={() => {
            addModal.close();
            resetForm();
          }}
          formData={formData}
          setFormData={setFormData}
        />
      </Modal>

      {/* View Blog Modal */}
      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="View Blog Details"
        size="xxlarge"
      >
        {selectedBlog && (
          <div className="space-y-6">
            <div className="aspect-video relative rounded-lg overflow-hidden bg-gray-200"></div>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-semibold mb-2">
                  {selectedBlog.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedBlog.content}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                        {selectedBlog.continent}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedBlog.country}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedBlog.updatedAt}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedBlog.videoUrl && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Video URL
                      </label>
                      <a
                        href={selectedBlog.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm break-all mt-1"
                      >
                        {selectedBlog.videoUrl}
                      </a>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Created
                    </label>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedBlog.createdAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Blog Modal */}
      <Modal
        open={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Blog"
        size="xxlarge"
      >
        <BlogForm
          onSubmit={handleUpdateBlog}
          submitText="Update Blog"
          onCancel={() => {
            editModal.close();
            setSelectedBlog(null);
            resetForm();
          }}
          formData={formData}
          setFormData={setFormData}
        />
      </Modal>

      <DeleteModal
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
        title="Delete Blog"
        text={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
