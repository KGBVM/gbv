import { useEffect, useState, useCallback, useMemo } from "react";
import xios from "@/Utils/xios";
import axios from "axios";

export default function useData() {
    /* ------------------------------------------------------------------
     | State - Organization & Partners
     * ------------------------------------------------------------------ */
    const [organizationTypes, setOrganizationTypes] = useState([]);
    const [partners, setPartners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ------------------------------------------------------------------
     | State - Location Data
     * ------------------------------------------------------------------ */
    const [counties, setCounties] = useState([]);
    const [subCounties, setSubCounties] = useState([]);
    const [wards, setWards] = useState([]);
    const [villages, setVillages] = useState([]);

    const [locationLoading, setLocationLoading] = useState({
        counties: false,
        subCounties: false,
        wards: false,
        villages: false,
    });

    const [selectedCounty, setSelectedCounty] = useState(null);
    const [selectedSubCounty, setSelectedSubCounty] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedVillage, setSelectedVillage] = useState(null);

    /* ------------------------------------------------------------------
     | API Calls - Organization & Partners
     * ------------------------------------------------------------------ */
    const fetchOrganizationTypes = useCallback(async () => {
        try {
            const { data } = await xios.get(route("api.organization-types"));
            setOrganizationTypes(data?.data ?? data);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err.message ||
                "Failed to fetch organization types";
            setError(message);
            console.error("Error fetching organization types:", err);
        }
    }, []);

    const fetchPartners = useCallback(async () => {
        try {
            const { data } = await xios.get(route("api.partners"));
            setPartners(data?.data ?? data);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err.message ||
                "Failed to fetch partners";
            setError(message);
            console.error("Error fetching partners:", err);
        }
    }, []);

    /* ------------------------------------------------------------------
     | API Calls - Location Data
     * ------------------------------------------------------------------ */
    const fetchCounties = useCallback(async () => {
        setLocationLoading((prev) => ({ ...prev, counties: true }));
        try {
            const response = await axios.get("/api/locations/counties");
            setCounties(response.data);
        } catch (error) {
            console.error("Error fetching counties:", error);
            setError(
                error?.response?.data?.message ||
                    error.message ||
                    "Failed to fetch counties",
            );
        } finally {
            setLocationLoading((prev) => ({ ...prev, counties: false }));
        }
    }, []);

    const fetchSubCounties = useCallback(async (countyId) => {
        if (!countyId) {
            setSubCounties([]);
            return;
        }

        setLocationLoading((prev) => ({ ...prev, subCounties: true }));
        try {
            const response = await axios.get(
                `/api/locations/sub-counties/${countyId}`,
            );
            setSubCounties(response.data);
        } catch (error) {
            console.error("Error fetching sub-counties:", error);
            setError(
                error?.response?.data?.message ||
                    error.message ||
                    "Failed to fetch sub-counties",
            );
        } finally {
            setLocationLoading((prev) => ({ ...prev, subCounties: false }));
        }
    }, []);

    const fetchWards = useCallback(async (subCountyId) => {
        if (!subCountyId) {
            setWards([]);
            return;
        }

        setLocationLoading((prev) => ({ ...prev, wards: true }));
        try {
            const response = await axios.get(
                `/api/locations/wards/${subCountyId}`,
            );
            setWards(response.data);
        } catch (error) {
            console.error("Error fetching wards:", error);
            setError(
                error?.response?.data?.message ||
                    error.message ||
                    "Failed to fetch wards",
            );
        } finally {
            setLocationLoading((prev) => ({ ...prev, wards: false }));
        }
    }, []);

    const fetchVillages = useCallback(async (wardId) => {
        if (!wardId) {
            setVillages([]);
            return;
        }

        setLocationLoading((prev) => ({ ...prev, villages: true }));
        try {
            const response = await axios.get(
                `/api/locations/villages/${wardId}`,
            );
            setVillages(response.data);
        } catch (error) {
            console.error("Error fetching villages:", error);
            setError(
                error?.response?.data?.message ||
                    error.message ||
                    "Failed to fetch villages",
            );
        } finally {
            setLocationLoading((prev) => ({ ...prev, villages: false }));
        }
    }, []);

    /* ------------------------------------------------------------------
     | Location Handlers
     * ------------------------------------------------------------------ */
    const handleCountyChange = useCallback(
        (county) => {
            setSelectedCounty(county);
            setSelectedSubCounty(null);
            setSelectedWard(null);
            setSelectedVillage(null);
            setSubCounties([]);
            setWards([]);
            setVillages([]);

            if (county) {
                fetchSubCounties(county.value);
            }
        },
        [fetchSubCounties],
    );

    const handleSubCountyChange = useCallback(
        (subCounty) => {
            setSelectedSubCounty(subCounty);
            setSelectedWard(null);
            setSelectedVillage(null);
            setWards([]);
            setVillages([]);

            if (subCounty) {
                fetchWards(subCounty.value);
            }
        },
        [fetchWards],
    );

    const handleWardChange = useCallback(
        (ward) => {
            setSelectedWard(ward);
            setSelectedVillage(null);
            setVillages([]);

            if (ward) {
                fetchVillages(ward.value);
            }
        },
        [fetchVillages],
    );

    const handleVillageChange = useCallback((village) => {
        setSelectedVillage(village);
    }, []);

    const resetSelections = useCallback(() => {
        setSelectedCounty(null);
        setSelectedSubCounty(null);
        setSelectedWard(null);
        setSelectedVillage(null);
        setSubCounties([]);
        setWards([]);
        setVillages([]);
    }, []);

    /* ------------------------------------------------------------------
     | Fetch All Data
     * ------------------------------------------------------------------ */
    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        await Promise.all([
            fetchOrganizationTypes(),
            fetchPartners(),
            fetchCounties(),
        ]);
        setIsLoading(false);
    }, [fetchOrganizationTypes, fetchPartners, fetchCounties]);

    /* ------------------------------------------------------------------
     | Lifecycle
     * ------------------------------------------------------------------ */
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    /* ------------------------------------------------------------------
     | Public API
     * ------------------------------------------------------------------ */
    return {
        // Organization & Partners data
        organizationTypes,
        partners,
        isLoading,
        error,
        refetch: fetchAll,

        // Location data
        counties,
        subCounties,
        wards,
        villages,

        // Location loading states
        locationLoading,

        // Selected location values
        selectedCounty,
        selectedSubCounty,
        selectedWard,
        selectedVillage,

        // Location handlers
        handleCountyChange,
        handleSubCountyChange,
        handleWardChange,
        handleVillageChange,
        resetSelections,

        // Individual fetch functions (if needed externally)
        fetchCounties,
        fetchSubCounties,
        fetchWards,
        fetchVillages,
    };
}
