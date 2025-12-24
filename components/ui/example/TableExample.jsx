"use client";
import {
  LuBadgeCheck,
  LuBadgeX,
  LuCalendar,
  LuDollarSign,
} from "react-icons/lu";
import { Table } from "@/components/ui/table/Table";

// Sample data
const generateData = (count) => {
  const statuses = ["active", "pending", "inactive", "completed"];
  const names = [
    "John Doe",
    "Jane Smith",
    "Robert Johnson",
    "Emily Davis",
    "Michael Wilson",
    "Sarah Brown",
    "David Miller",
    "Lisa Garcia",
    "James Martinez",
    "Jennifer Robinson",
  ];
  const companies = [
    "Acme Inc",
    "Globex Corp",
    "Initech",
    "Umbrella Corp",
    "Stark Industries",
    "Wayne Enterprises",
    "Cyberdyne Systems",
    "Soylent Corp",
    "Massive Dynamic",
    "Oscorp",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[Math.floor(Math.random() * names.length)],
    email: `example${i + 1}@example.com`,
    company: companies[Math.floor(Math.random() * companies.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    amount: Math.floor(Math.random() * 10000) / 100,
    date: new Date(
      Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
    )
      .toISOString()
      .split("T")[0],
  }));
};

const sampleData = generateData(50);

// Define columns
const columns = [
  {
    id: "name",
    header: "Name",
    accessor: (row) => row.name,
    minWidth: "150px",
  },
  {
    id: "email",
    header: "Email",
    accessor: (row) => row.email,
  },
  {
    id: "company",
    header: "Company",
    accessor: (row) => row.company,
    minWidth: "190px",
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => row.status,
    cell: (value) => (
      <div className="flex items-center">
        {value === "active" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <LuBadgeCheck className="mr-1 h-3 w-3" />
            Active
          </span>
        )}
        {value === "pending" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <LuCalendar className="mr-1 h-3 w-3" />
            Pending
          </span>
        )}
        {value === "inactive" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <LuBadgeX className="mr-1 h-3 w-3" />
            Inactive
          </span>
        )}
        {value === "completed" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <LuBadgeCheck className="mr-1 h-3 w-3" />
            Completed
          </span>
        )}
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    accessor: (row) => row.amount,
    cell: (value) => (
      <div className="flex items-center">
        <LuDollarSign className="mr-1 h-3 w-3 text-muted-foreground" />
        {value.toFixed(2)}
      </div>
    ),
  },
  {
    id: "date",
    header: "Date",
    minWidth: "120px",
    accessor: (row) => row.date,
  },
];

export default function TableExample() {
  // Action handlers
  const handleView = (row) => {
    alert(`Viewing ${row.name}`);
  };

  const handleEdit = (row) => {
    alert(`Editing ${row.name}`);
  };

  const handleDelete = (row) => {
    alert(`Deleting ${row.name}`);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="font-medium mb-6">Dynamic Responsive Table</h1>

      <Table
        data={sampleData}
        columns={columns}
        pagination={true}
        pageSize={10}
        sorting={true}
        filtering={true}
        actions={{
          view: handleView,
          edit: handleEdit,
          delete: handleDelete,
        }}
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  );
}
