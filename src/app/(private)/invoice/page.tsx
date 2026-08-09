import InvoiceList from "./components/invoicedashoard";

export default function page() {
  return (
    <div className="flex  w-full  justify-center p-3 md:px-10">
      <div className="w-full ">
        <InvoiceList />
      </div>
    </div>
  );
}
