import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

const ProfileEdit = ({ user }) => {
    return (
        <AuthenticatedLayout>
            <Head title="Edit Profile" />
        </AuthenticatedLayout>
    );
};

export default ProfileEdit;
