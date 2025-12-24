import SideNav from "@/components/layout/main/sideNav/SideNav";
import TopNav from "@/components/layout/main/topNav/TopNav";
import ProviderLayout from "@/components/layout/ProviderLayout";

export default function layout({ children }) {
  return (
    <>
      <TopNav />
      <ProviderLayout>
        <SideNav />
        {children}
      </ProviderLayout>
    </>
  );
}
