import FormExample from "@/components/ui/example/FormExample";
import ModalExample from "@/components/ui/example/ModalExample";
import { ThemeToggle } from "@/components/ui/theme/ThemeToggle";
import TableExample from "@/components/ui/example/TableExample";
import ButtonExample from "@/components/ui/example/ButtonExample";
import PaginationExamples from "@/components/ui/example/PaginationExample";
import DropdownDemo from "@/components/ui/example/DropdownExample";
import CalendarExamples from "@/components/ui/example/CalenderExample";

export default function UiPage() {
  return (
    <div>
      <FormExample />
      <CalendarExamples />
      <ButtonExample />
      <ModalExample />
      <DropdownDemo />
      <PaginationExamples />
      <TableExample />

      <div className="max-w-xl mx-auto">
        <ThemeToggle />
      </div>
    </div>
  );
}
