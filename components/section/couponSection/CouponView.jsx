import moment from "moment";
import { LuTag } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import { MultipleSearchSelect } from "@/components/ui/select/MultipleSearchSelect";
import { useGetPackageIdAndNameListFromDBQuery } from "@/features/package/packageApiSlice";

export default function CouponView({ viewModal, selectedCoupon }) {
  // Packages data
  const { data } = useGetPackageIdAndNameListFromDBQuery();
  const couponType = data?.data || [];

  const formattedCouponType = couponType.map(({ _id, name }) => ({
    value: _id,
    label: name,
  }));

  const fields = [
    { label: "Code", value: selectedCoupon?.code },
    { label: "Description", value: selectedCoupon?.description },
    { label: "Coupon Type", value: selectedCoupon?.couponType },
    { label: "Discount Value", value: selectedCoupon?.discountValue },
    {
      label: "Expiry Date",
      value: moment(selectedCoupon?.expiryDate).format(
        "DD MMMM YYYY [at] HH:mm A",
      ),
    },
    { label: "Status", value: selectedCoupon?.status },
    { label: "Usage Limit", value: selectedCoupon?.usageLimit },
  ];

  console.log(selectedCoupon?.applicablePackages);

  return (
    <Modal
      open={viewModal.isOpen}
      onClose={viewModal.close}
      title="View Coupon"
      size="xxlarge"
    >
      {selectedCoupon && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-0.5">
          {fields.map(({ label, value }) => (
            <Input
              key={value}
              label={label}
              value={value}
              readOnly
              className="bg-gray-50 h-12 dark:bg-transparent dark:border-[#475569]"
              fullWidth
            />
          ))}
          <div>
            <MultipleSearchSelect
              label="Applicable Packages"
              placeholder="Select your Packages"
              searchPlaceholder="Search for Packages..."
              options={formattedCouponType}
              startIcon={<LuTag className="h-4 w-4" />}
              fullWidth
              value={selectedCoupon?.applicablePackages}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
