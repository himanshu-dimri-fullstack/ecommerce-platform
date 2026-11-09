
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { API } from "@/axios/axios";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    FiMapPin,
    FiPlus,
    FiHome,
    FiBriefcase,
    FiMap,
    FiEdit2,
    FiTrash2,
    FiCheck,
    FiX,
    FiShoppingBag,
    FiTruck,
    FiCreditCard,
    FiArrowLeft,
    FiShield,
} from "react-icons/fi";

import { fetchCart } from "@/redux/cartSlice";

const ADDRESS_API = "/address";

// ==========================================
// RAZORPAY TYPES
// ==========================================

interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayFailureResponse {
    error?: {
        code?: string;
        description?: string;
        reason?: string;
    };
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;

    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };

    theme?: {
        color: string;
    };

    handler: (response: RazorpaySuccessResponse) => void;

    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayInstance {
    open: () => void;

    on: (
        event: "payment.failed",
        callback: (response: RazorpayFailureResponse) => void
    ) => void;
}

declare global {
    interface Window {
        Razorpay: new (
            options: RazorpayOptions
        ) => RazorpayInstance;
    }
}

// ==========================================
// LOAD RAZORPAY SCRIPT
// ==========================================

const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (typeof window === "undefined") {
            resolve(false);
            return;
        }

        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");

        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

// ==========================================
// INTERFACES
// ==========================================

export interface User {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;

    profileImage?: {
        url: string;
        public_id: string;
    };

    phone?: string;
}

export interface CartItem {
    _id: string;
    productId: string;
    productName: string;
    name: string;
    unitValue?: string;
    unit?: string;
    sellingPrice: number;
    mrp: number;
    image: string;
    quantity: number;
}

interface Address {
    _id: string;
    type: "home" | "work" | "other";
    houseNumber: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;

    location?: {
        type: "Point";
        coordinates: number[];
    };
}

interface AddressForm {
    type: "home" | "work" | "other";
    houseNumber: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
}

interface ContactForm {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const initialAddress: AddressForm = {
    type: "home",
    houseNumber: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
};

const addressIcons = {
    home: FiHome,
    work: FiBriefcase,
    other: FiMap,
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);

// ==========================================
// CHECKOUT PAGE
// ==========================================

export default function CheckoutPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    // ==========================================
    // REDUX
    // ==========================================

    const user = useSelector(
        (store: RootState) => store.auth.user
    ) as User | null;

    const cartItems = useSelector(
        (store: RootState) => store.cart.items
    ) as CartItem[];

    // CURRENT SELECTED / NEAREST STORE

    const nearestStore = useSelector(
        (store: RootState) => store.store.store
    );

    const storeId = nearestStore?._id as string | undefined;

    // ==========================================
    // CONTACT DETAILS
    // ==========================================

    const [contact, setContact] = useState<ContactForm>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    // ==========================================
    // ADDRESSES
    // ==========================================

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ==========================================
    // ADDRESS MODAL
    // ==========================================

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState<AddressForm>(initialAddress);

    // ==========================================
    // PAYMENT
    // ==========================================

    const [paymentMethod, setPaymentMethod] = useState<"cod" | "online" | "">("");
    const [processing, setProcessing] = useState(false);

    // ==========================================
    // PREFILL CONTACT DETAILS
    // ==========================================

    useEffect(() => {
        if (user) {
            setContact({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
            });
        }
    }, [user]);

    // ==========================================
    // CART SUMMARY
    // ==========================================

    const subtotal = useMemo(() => {
        return (cartItems || []).reduce(
            (total, item) =>
                total +
                Number(item.sellingPrice || 0) *
                Number(item.quantity || 0),
            0
        );
    }, [cartItems]);

    const totalItems = useMemo(() => {
        return (cartItems || []).reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    }, [cartItems]);

    const deliveryCharge = subtotal === 0 || subtotal >= 499 ? 0 : 40;
    const grandTotal = subtotal + deliveryCharge;

    // ==========================================
    // FETCH ADDRESSES
    // ==========================================

    const fetchAddresses = async (preferredId?: string) => {
        try {
            const { data } = await API.get(
                `${ADDRESS_API}/get`,
                { withCredentials: true }
            );

            if (data.success) {
                const fetched: Address[] = data.addresses || [];

                setAddresses(fetched);

                const preferred = fetched.find(
                    (item) => item._id === preferredId
                );

                const defaultAddress = fetched.find(
                    (item) => item.isDefault
                );

                setSelectedAddress(
                    preferred?._id ||
                    defaultAddress?._id ||
                    fetched[0]?._id ||
                    ""
                );
            }
        } catch (error: unknown) {
            const message = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                }
            )?.response?.data?.message;

            toast.error(message || "Unable to fetch addresses");
        }
    };

    // ==========================================
    // INITIAL ADDRESS FETCH
    // ==========================================

    useEffect(() => {
        const loadAddresses = async () => {
            try {
                await fetchAddresses();
            } finally {
                setLoading(false);
            }
        };

        loadAddresses();
    }, []);

    // ==========================================
    // ADD ADDRESS
    // ==========================================

    const handleAddAddress = () => {
        if (addresses.length >= 5) {
            toast.error("Maximum 5 addresses allowed");
            return;
        }

        setEditingAddress(null);
        setAddressForm(initialAddress);
        setShowAddressModal(true);
    };

    // ==========================================
    // EDIT ADDRESS
    // ==========================================

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);

        setAddressForm({
            type: address.type,
            houseNumber: address.houseNumber,
            street: address.street,
            landmark: address.landmark || "",
            city: address.city,
            state: address.state,
            country: address.country,
            pincode: address.pincode,
        });

        setShowAddressModal(true);
    };

    // ==========================================
    // ADDRESS INPUT
    // ==========================================

    const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setAddressForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ==========================================
    // SAVE ADDRESS
    // ==========================================

    const handleSaveAddress = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (saving) return;

        if (!editingAddress && addresses.length >= 5) {
            toast.error("Maximum 5 addresses allowed");
            return;
        }

        if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
            toast.error("Enter a valid 6-digit pincode");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...addressForm,
                houseNumber: addressForm.houseNumber.trim(),
                street: addressForm.street.trim(),
                landmark: addressForm.landmark.trim(),
                city: addressForm.city.trim(),
                state: addressForm.state.trim(),
                country: addressForm.country.trim(),
                pincode: addressForm.pincode.trim(),

                ...(!editingAddress && { isDefault: true }),
            };

            let addressId = "";

            if (editingAddress) {
                const { data } = await API.patch(
                    `${ADDRESS_API}/update/${editingAddress._id}`,
                    payload,
                    { withCredentials: true }
                );

                if (data.success) {
                    addressId = data.address._id;
                    toast.success("Address updated successfully");
                }
            } else {
                const { data } = await API.post(
                    `${ADDRESS_API}/add`,
                    payload,
                    { withCredentials: true }
                );

                if (data.success) {
                    addressId = data.address._id;
                    toast.success("Address added successfully");
                }
            }

            setShowAddressModal(false);
            setEditingAddress(null);
            setAddressForm(initialAddress);

            await fetchAddresses(addressId);

        } catch (error: unknown) {
            const message = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                }
            )?.response?.data?.message;

            toast.error(message || "Unable to save address");

        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // DELETE ADDRESS
    // ==========================================

    const handleDeleteAddress = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this address?")) {
            return;
        }

        try {
            setDeletingId(id);

            const { data } = await API.delete(
                `${ADDRESS_API}/delete/${id}`,
                { withCredentials: true }
            );

            if (data.success) {
                toast.success("Address deleted successfully");

                await fetchAddresses(
                    selectedAddress === id ? undefined : selectedAddress
                );
            }
        } catch (error: unknown) {
            const message = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                }
            )?.response?.data?.message;

            toast.error(message || "Unable to delete address");

        } finally {
            setDeletingId(null);
        }
    };

    // ==========================================
    // CHECKOUT VALIDATION
    // ==========================================

    const isAddressValid = addresses.some(
        (address) => address._id === selectedAddress
    );

    const canProceed =
        isAddressValid &&
        Boolean(storeId) &&
        Boolean(paymentMethod) &&
        cartItems.length > 0 &&
        !processing;

    // ==========================================
    // VERIFY RAZORPAY PAYMENT
    // ==========================================

    const verifyOnlinePayment = async (
        orderId: string,
        response: RazorpaySuccessResponse
    ) => {
        try {
            toast.loading("Verifying your payment...", {
                id: "payment-verification",
            });

            const { data } = await API.post(
                "/order/verify-payment",
                {
                    orderId,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                },
                {
                    withCredentials: true,
                }
            );

            if (!data.success) {
                throw new Error(
                    data.message || "Payment verification failed"
                );
            }

            toast.success(
                "Payment successful! Order confirmed.",
                {
                    id: "payment-verification",
                }
            );

            console.log("Verified Order:", data.order);
            console.log("Verified Payment:", data.payment);

            // Refresh only the cart belonging to this store.

            if (storeId) {
                await dispatch(fetchCart(storeId));
            }

            router.replace("/orders");

        } catch (error: unknown) {
            const message = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                    message?: string;
                }
            )?.response?.data?.message ||
                (error as { message?: string })?.message;

            toast.error(
                message || "Payment verification failed",
                {
                    id: "payment-verification",
                }
            );

            console.error("Payment Verification Error:", error);

        } finally {
            setProcessing(false);
        }
    };

    // ==========================================
    // CANCEL UNPAID ONLINE ORDER
    // ==========================================

    const cancelOnlineOrder = async (orderId: string) => {
        try {
            const { data } = await API.post(
                "/order/cancel-online",
                {
                    orderId,
                },
                {
                    withCredentials: true,
                }
            );

            if (data.success) {
                toast("Payment cancelled. Your cart is safe.");
                return;
            }

            toast.error(
                data.message || "Unable to cancel payment order"
            );

        } catch (error: unknown) {
            const response = error as {
                response?: {
                    status?: number;
                    data?: {
                        message?: string;
                    };
                };
            };

            if (response.response?.status === 409) {
                toast.error(
                    response.response.data?.message ||
                    "Payment status is being checked. Please check your orders."
                );
            } else {
                toast.error(
                    response.response?.data?.message ||
                    "Unable to cancel payment order. Your cart has not been cleared."
                );
            }

            console.error("Cancel Online Order Error:", error);
        }
    };

    // ==========================================
    // PROCEED TO PAY
    // ==========================================

    const handleProceedToPay = async () => {
        if (!isAddressValid) {
            toast.error("Please select a delivery address");
            return;
        }

        if (!storeId) {
            toast.error("Unable to identify your delivery store. Please select your location again.");
            return;
        }

        if (!cartItems?.length) {
            toast.error("Your cart is empty");
            return;
        }

        if (!paymentMethod) {
            toast.error("Please select a payment method");
            return;
        }

        if (processing) return;

        try {
            setProcessing(true);

            // ======================================
            // COD PAYMENT
            // ======================================

            if (paymentMethod === "cod") {
                const { data } = await API.post(
                    "/order/place",
                    {
                        addressId: selectedAddress,
                        paymentMethod: "cod",
                        storeId,
                    },
                    {
                        withCredentials: true,
                    }
                );

                if (!data.success) {
                    throw new Error(
                        data.message || "Unable to place order"
                    );
                }

                toast.success(
                    data.message || "Order placed successfully"
                );

                console.log("COD Order:", data.order);
                console.log("COD Payment:", data.payment);

                // Refresh only the current store's cart.

                await dispatch(fetchCart(storeId));

                router.replace("/orders");

                return;
            }

            // ======================================
            // ONLINE PAYMENT - LOAD RAZORPAY
            // ======================================

            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error(
                    "Unable to load Razorpay. Please try again."
                );
            }

            // ======================================
            // CREATE ONLINE ORDER
            // ======================================

            const { data } = await API.post(
                "/order/create-online",
                {
                    addressId: selectedAddress,
                    storeId,
                },
                {
                    withCredentials: true,
                }
            );

            if (!data.success) {
                throw new Error(
                    data.message || "Unable to create online order"
                );
            }

            const razorpayData = data.razorpay;

            if (
                !razorpayData?.keyId ||
                !razorpayData?.orderId ||
                !razorpayData?.amount
            ) {
                throw new Error(
                    "Invalid Razorpay order details received"
                );
            }

            console.log("Online Order:", data.order);

            // This flag prevents cancellation when Razorpay calls
            // ondismiss after a successful payment handler.

            let verificationStarted = false;

            // ======================================
            // RAZORPAY OPTIONS
            // ======================================

            const options: RazorpayOptions = {
                key: razorpayData.keyId,

                amount: razorpayData.amount,

                currency: razorpayData.currency,

                name: "QUICK KART",

                description: `Payment for ${data.order.orderNumber}`,

                order_id: razorpayData.orderId,

                prefill: {
                    name: `${contact.firstName} ${contact.lastName}`.trim(),
                    email: contact.email,
                    contact: contact.phone,
                },

                theme: {
                    color: "#0c831f",
                },

                // ==================================
                // PAYMENT SUCCESS
                // ==================================

                handler: async (response) => {
                    verificationStarted = true;

                    await verifyOnlinePayment(
                        data.order._id,
                        response
                    );
                },

                // ==================================
                // POPUP CLOSE / CANCEL
                // ==================================

                modal: {
                    ondismiss: async () => {
                        // If payment verification has started,
                        // do not cancel the order.

                        if (verificationStarted) {
                            return;
                        }

                        toast("Payment window closed.");

                        // Backend checks Razorpay payment status
                        // before deleting the temporary order.

                        await cancelOnlineOrder(data.order._id);

                        setProcessing(false);
                    },
                },
            };

            // ======================================
            // OPEN RAZORPAY CHECKOUT
            // ======================================

            const razorpay = new window.Razorpay(options);

            // ======================================
            // PAYMENT FAILED
            // ======================================

            razorpay.on("payment.failed", (response) => {
                console.error(
                    "Razorpay Payment Failed:",
                    response.error
                );

                toast.error(
                    response.error?.description ||
                    "Payment failed. You can retry or close the payment window."
                );

                // IMPORTANT:
                // Do not cancel the order here.
                // User may retry payment inside Razorpay popup.
                // Cleanup happens only when popup is dismissed.
            });

            razorpay.open();

        } catch (error: unknown) {
            const message = (
                error as {
                    response?: {
                        data?: {
                            message?: string;
                        };
                    };
                    message?: string;
                }
            )?.response?.data?.message ||
                (error as { message?: string })?.message;

            toast.error(message || "Unable to proceed");

            console.error("Checkout Error:", error);

            setProcessing(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8f7] p-5">
                <div className="mx-auto max-w-7xl animate-pulse">
                    <div className="mb-8 h-9 w-52 rounded-lg bg-gray-200" />

                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="space-y-5 lg:col-span-2">
                            <div className="h-64 rounded-2xl bg-gray-200" />
                            <div className="h-72 rounded-2xl bg-gray-200" />
                        </div>

                        <div className="h-96 rounded-2xl bg-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // MAIN UI
    // ==========================================

    return (
        <div className="min-h-screen bg-[#f7f8f7] pb-12">

            {/* HEADER */}

            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

                    <Link
                        href="/"
                        className="text-2xl font-black tracking-tight text-[#0c831f]"
                    >
                        QUICK KART
                    </Link>

                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                        <FiShield className="text-[#0c831f]" size={19} />
                        Secure Checkout
                    </div>

                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">

                {/* PAGE TITLE */}

                <div className="mb-4">
                    <Link
                        href="/cart"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0c831f]"
                    >
                        <FiArrowLeft />
                        Back to Cart
                    </Link>
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-3">

                    <div className="space-y-7 lg:col-span-2">

                        {/* DELIVERY ADDRESS */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]">
                                        <FiMapPin size={22} />
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Delivery Address
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Select your delivery location
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                                    {addresses.length}/5 Saved
                                </span>

                            </div>

                            {addresses.length > 0 ? (

                                <div className="grid gap-4 sm:grid-cols-2">

                                    {addresses.map((address) => {
                                        const Icon = addressIcons[address.type] || FiMap;

                                        const isSelected =
                                            selectedAddress === address._id;

                                        return (
                                            <div
                                                key={address._id}
                                                onClick={() =>
                                                    setSelectedAddress(address._id)
                                                }
                                                className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${isSelected
                                                    ? "border-[#0c831f] bg-[#f3fbf3]"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >

                                                <div className="flex items-start gap-3">

                                                    <div
                                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isSelected
                                                            ? "bg-[#0c831f] text-white"
                                                            : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        <Icon size={21} />
                                                    </div>

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <h3 className="font-bold capitalize text-gray-900">
                                                                {address.type}
                                                            </h3>

                                                            {address.isDefault && (
                                                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                                                    Default
                                                                </span>
                                                            )}

                                                        </div>

                                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                                            {address.houseNumber}, {address.street}
                                                        </p>

                                                        {address.landmark && (
                                                            <p className="text-sm text-gray-600">
                                                                Near {address.landmark}
                                                            </p>
                                                        )}

                                                        <p className="text-sm leading-6 text-gray-600">
                                                            {address.city}, {address.state} - {address.pincode}
                                                        </p>

                                                        <p className="text-sm text-gray-600">
                                                            {address.country}
                                                        </p>

                                                        <div className="mt-4 flex flex-wrap gap-3">

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditAddress(address);
                                                                }}
                                                                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-[#0c831f]"
                                                            >
                                                                <FiEdit2 size={14} />
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    deletingId === address._id
                                                                }
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteAddress(address._id);
                                                                }}
                                                                className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                                                            >
                                                                <FiTrash2 size={14} />

                                                                {deletingId === address._id
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>

                                                        </div>

                                                    </div>

                                                    <div
                                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isSelected
                                                            ? "border-[#0c831f] bg-[#0c831f] text-white"
                                                            : "border-gray-300"
                                                            }`}
                                                    >
                                                        {isSelected && (
                                                            <FiCheck size={14} />
                                                        )}
                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    })}

                                </div>

                            ) : (

                                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">

                                    <FiMapPin
                                        size={34}
                                        className="mx-auto text-gray-400"
                                    />

                                    <h3 className="mt-4 font-bold text-gray-800">
                                        No saved addresses
                                    </h3>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Add your delivery address to continue.
                                    </p>

                                </div>

                            )}

                            {addresses.length < 5 && (

                                <button
                                    type="button"
                                    onClick={handleAddAddress}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0c831f]/40 bg-green-50/50 px-4 py-4 font-bold text-[#0c831f] transition hover:border-[#0c831f] hover:bg-green-50"
                                >
                                    <FiPlus size={20} />
                                    Add New Address
                                </button>

                            )}

                            {addresses.length >= 5 && (
                                <p className="mt-4 text-center text-sm font-medium text-gray-500">
                                    Maximum 5 saved addresses reached.
                                </p>
                            )}

                        </section>

                        {/* PAYMENT METHOD */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

                            <div className="mb-6 flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]">
                                    <FiCreditCard size={22} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Payment Method
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Select your preferred payment option
                                    </p>
                                </div>

                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">

                                {([
                                    {
                                        value: "cod",
                                        title: "Cash on Delivery",
                                        description: "Pay when your order arrives",
                                        Icon: FiTruck,
                                    },
                                    {
                                        value: "online",
                                        title: "Online Payment",
                                        description: "UPI, Cards, Wallets and Net Banking",
                                        Icon: FiCreditCard,
                                    },
                                ] as const).map((option) => {
                                    const Icon = option.Icon;

                                    const active =
                                        paymentMethod === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() =>
                                                setPaymentMethod(option.value)
                                            }
                                            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${active
                                                ? "border-[#0c831f] bg-green-50"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >

                                            <Icon
                                                size={23}
                                                className="text-[#0c831f]"
                                            />

                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">
                                                    {option.title}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {option.description}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active
                                                    ? "border-[#0c831f] bg-[#0c831f]"
                                                    : "border-gray-300"
                                                    }`}
                                            >
                                                {active && (
                                                    <FiCheck
                                                        size={12}
                                                        className="text-white"
                                                    />
                                                )}
                                            </div>

                                        </button>
                                    );
                                })}

                            </div>

                        </section>

                    </div>

                    {/* ORDER SUMMARY */}

                    <aside className="sticky top-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

                        <div className="mb-6 flex items-center gap-3">
                            <FiShoppingBag
                                size={22}
                                className="text-[#0c831f]"
                            />

                            <h2 className="text-xl font-bold text-gray-900">
                                Order Summary
                            </h2>
                        </div>

                        <div className="max-h-80 space-y-4 overflow-y-auto pr-1">

                            {cartItems?.length > 0 ? (

                                cartItems.map((item, index) => (

                                    <div
                                        key={item._id || item.productId || index}
                                        className="flex gap-3"
                                    >

                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">

                                            {item.image && (
                                                <Image
                                                    src={item.image}
                                                    alt={item.productName || item.name}
                                                    fill
                                                    sizes="64px"
                                                    className="object-contain p-1"
                                                />
                                            )}

                                        </div>

                                        <div className="min-w-0 flex-1">

                                            <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">
                                                {item.productName || item.name}
                                            </h3>

                                            {(item.unitValue || item.unit) && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {item.unitValue} {item.unit}
                                                </p>
                                            )}

                                            <p className="mt-1 text-xs text-gray-500">
                                                Qty: {item.quantity}
                                            </p>

                                            <p className="mt-1 font-bold text-gray-900">
                                                {formatPrice(
                                                    Number(item.sellingPrice || 0) *
                                                    Number(item.quantity || 0)
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                ))

                            ) : (

                                <div className="py-8 text-center">

                                    <FiShoppingBag
                                        size={32}
                                        className="mx-auto text-gray-300"
                                    />

                                    <p className="mt-3 text-sm text-gray-500">
                                        Your cart is empty
                                    </p>

                                    <Link
                                        href="/"
                                        className="mt-3 inline-block font-bold text-[#0c831f]"
                                    >
                                        Continue Shopping
                                    </Link>

                                </div>

                            )}

                        </div>

                        <div className="my-5 border-t border-gray-200" />

                        <div className="space-y-4 text-sm">

                            <div className="flex justify-between text-gray-600">
                                <span>Items ({totalItems})</span>

                                <span className="font-semibold text-gray-900">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>

                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Charges</span>

                                <span className="font-semibold">
                                    {deliveryCharge === 0 ? (
                                        <span className="text-[#0c831f]">
                                            FREE
                                        </span>
                                    ) : (
                                        formatPrice(deliveryCharge)
                                    )}
                                </span>
                            </div>

                            {subtotal > 0 && subtotal < 499 && (
                                <p className="rounded-lg bg-green-50 p-3 text-xs leading-5 text-green-700">
                                    Add {formatPrice(499 - subtotal)} more to get free delivery.
                                </p>
                            )}

                        </div>

                        <div className="my-5 border-t border-dashed border-gray-300" />

                        <div className="flex items-center justify-between">

                            <span className="text-base font-bold text-gray-900">
                                Total Amount
                            </span>

                            <span className="text-2xl font-extrabold text-[#0c831f]">
                                {formatPrice(grandTotal)}
                            </span>

                        </div>

                        {/* PROCEED BUTTON */}

                        <button
                            type="button"
                            onClick={handleProceedToPay}
                            disabled={!canProceed}
                            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-5 py-4 font-bold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#096b19] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                        >

                            {processing ? (

                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Processing...
                                </>

                            ) : (

                                <>
                                    {paymentMethod === "online"
                                        ? "Proceed to Pay"
                                        : "Place Order"}

                                    <FiCheck size={19} />
                                </>

                            )}

                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <FiShield className="text-[#0c831f]" />
                            Safe and secure checkout
                        </div>

                    </aside>

                </div>

            </main>

            {/* ======================================
                ADDRESS MODAL
            ====================================== */}

            {showAddressModal && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
                    onClick={() => {
                        if (!saving) setShowAddressModal(false);
                    }}
                >

                    <div
                        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-5 sm:px-7">

                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">
                                    {editingAddress
                                        ? "Edit Address"
                                        : "Add New Address"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Enter your complete delivery details.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setShowAddressModal(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                                <FiX size={20} />
                            </button>

                        </div>

                        <form
                            onSubmit={handleSaveAddress}
                            className="space-y-5 p-5 sm:p-7"
                        >

                            {/* ADDRESS TYPE */}

                            <div>

                                <label className="mb-3 block text-sm font-bold text-gray-800">
                                    Save Address As
                                </label>

                                <div className="grid grid-cols-3 gap-3">

                                    {([
                                        {
                                            value: "home",
                                            label: "Home",
                                            Icon: FiHome,
                                        },
                                        {
                                            value: "work",
                                            label: "Work",
                                            Icon: FiBriefcase,
                                        },
                                        {
                                            value: "other",
                                            label: "Other",
                                            Icon: FiMap,
                                        },
                                    ] as const).map((option) => {
                                        const Icon = option.Icon;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    setAddressForm((prev) => ({
                                                        ...prev,
                                                        type: option.value,
                                                    }))
                                                }
                                                className={`flex flex-col items-center gap-2 rounded-xl border-2 py-4 transition ${addressForm.type === option.value
                                                    ? "border-[#0c831f] bg-green-50 text-[#0c831f]"
                                                    : "border-gray-200 text-gray-600"
                                                    }`}
                                            >

                                                <Icon size={22} />

                                                <span className="text-sm font-bold">
                                                    {option.label}
                                                </span>

                                            </button>
                                        );
                                    })}

                                </div>

                            </div>

                            {/* HOUSE NUMBER */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    House / Flat / Building Number *
                                </label>

                                <input
                                    type="text"
                                    name="houseNumber"
                                    value={addressForm.houseNumber}
                                    onChange={handleAddressChange}
                                    placeholder="e.g. Flat 302, Block A"
                                    maxLength={100}
                                    required
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0c831f] focus:ring-2 focus:ring-green-100"
                                />

                            </div>

                            {/* STREET */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Street / Area *
                                </label>

                                <input
                                    type="text"
                                    name="street"
                                    value={addressForm.street}
                                    onChange={handleAddressChange}
                                    placeholder="Enter street or area"
                                    maxLength={150}
                                    required
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0c831f] focus:ring-2 focus:ring-green-100"
                                />

                            </div>

                            {/* LANDMARK */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Landmark (Optional)
                                </label>

                                <input
                                    type="text"
                                    name="landmark"
                                    value={addressForm.landmark}
                                    onChange={handleAddressChange}
                                    placeholder="Near metro station, school etc."
                                    maxLength={150}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0c831f] focus:ring-2 focus:ring-green-100"
                                />

                            </div>

                            {/* CITY / STATE */}

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        City *
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        placeholder="City"
                                        maxLength={100}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0c831f] focus:ring-2 focus:ring-green-100"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        State *
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={addressForm.state}
                                        onChange={handleAddressChange}
                                        placeholder="State"
                                        maxLength={100}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0c831f] focus:ring-2 focus:ring-green-100"
                                    />

                                </div>

                            </div>

                            {/* PINCODE / COUNTRY */}

                            <div className="grid gap-4 sm:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Pincode *
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={addressForm.pincode}
                                        onChange={handleAddressChange}
                                        placeholder="6-digit pincode"
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0c831f] focus:ring-2 focus:ring-green-100"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Country *
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={addressForm.country}
                                        onChange={handleAddressChange}
                                        maxLength={100}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#0c831f] focus:ring-2 focus:ring-green-100"
                                    />

                                </div>

                            </div>

                            {/* ACTION BUTTONS */}

                            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(false)}
                                    disabled={saving}
                                    className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-7 py-3 text-sm font-bold text-white hover:bg-[#096b19] disabled:opacity-60"
                                >

                                    {saving ? (

                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <FiCheck size={17} />
                                            {editingAddress
                                                ? "Update Address"
                                                : "Save Address"}
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}
