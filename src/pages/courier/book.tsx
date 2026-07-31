import DynamicSEO from "@/SEO/DynamicSEO";
import BookDeliveryPage from "@/views/Courier/BookDeliveryPage";

const BookCourierRoutePage: React.FC = () => {
    return (
        <>
            <DynamicSEO title="Book A Courier Delivery - Delimo" />
            <div className="">
                <BookDeliveryPage />
            </div>
        </>
    )
}

export default BookCourierRoutePage;