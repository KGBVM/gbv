import { Card, Image } from "react-bootstrap";

const EmptyState = ({ title = null, message = null }) => {
    return (
        <Card className="rounded-4 my-3">
            <Card.Body className="text-center">
                <Image
                    src="https://i.ibb.co/JWfwhymF/empty-state-removebg-preview.png"
                    alt="Empty State"
                    style={{ maxWidth: "200px" }}
                    className="img-fluid mb-4"
                />
                <div className="text-center text-white-50">
                    <h4 className="m-0">{title}</h4>
                    <p className="m-0">{message}</p>
                </div>
            </Card.Body>
        </Card>
    );
};

export default EmptyState;
