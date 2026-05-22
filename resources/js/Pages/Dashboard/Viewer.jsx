import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

const Viewer = () => {
    return (
        <AuthenticatedLayout>
            <Head title="Viewer Dashboard" />
        </AuthenticatedLayout>
    );
};

export default Viewer;
