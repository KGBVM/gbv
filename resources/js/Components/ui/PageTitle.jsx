export default function PageTitle({
    title = null,
    icon = null,
    description = null,
}) {
    return (
        <div className="paget-tile-content d-flex align-items-center">
            <span className="fs-1 bg-light bg-opacity-10 rounded me-2">
                {icon}
            </span>
            <div className="">
                <h3 className="fw-bold text-capitalize text-truncate m-0">
                    {title}
                </h3>
                <p className="text-muted mb-0">{description}</p>
            </div>
        </div>
    );
}
