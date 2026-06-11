"use client";

import { useEffect, useState } from "react";

type WifiPlan = {
  id: number;
  image: string;
  hiddenImage?: string;
};

export default function WifiPage() {
  const [plans, setPlans] = useState<WifiPlan[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [image, setImage] = useState("");
  const [hiddenImage, setHiddenImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const [unlocked, setUnlocked] = useState<number | null>(null);

  const uploadImage = async (
    file: File,
    type: "normal" | "hidden"
  ) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ott_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dl5tzgo05/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (type === "normal") {
        setImage(data.secure_url);
      } else {
        setHiddenImage(data.secure_url);
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const loadPlans = async () => {
    const res = await fetch("/api/wifi");
    const data = await res.json();
    setPlans(data);
  };

  useEffect(() => {
  const load = async () => {
    await loadPlans();
  };

  load();
}, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          WiFi Plans
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          + Add WiFi Plan
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl shadow-lg p-4 relative"
          >
            {/* 3 DOTS MENU */}
            <div className="absolute top-3 right-3">
              <button
                onClick={() =>
                  setMenuOpen(
                    menuOpen === plan.id
                      ? null
                      : plan.id
                  )
                }
                className="text-xl font-bold"
              >
                ⋮
              </button>

              {menuOpen === plan.id && (
                <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-50">
                  <button
                    onClick={async () => {
                      await fetch(
                        `/api/wifi/${plan.id}`,
                        {
                          method: "DELETE",
                        }
                      );

                      setPlans(
                        plans.filter(
                          (p) => p.id !== plan.id
                        )
                      );

                      setMenuOpen(null);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* MAIN IMAGE */}
            {plan.image && (
              <img
                src={plan.image}
                alt=""
                className="w-full h-48 object-cover rounded-xl"
              />
            )}

            {/* HIDDEN IMAGE */}
            {plan.hiddenImage &&
              (unlocked === plan.id ? (
                <img
                  src={plan.hiddenImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-xl mt-3"
                />
              ) : (
                <div className="relative mt-3">
                  <img
                    src={plan.hiddenImage}
                    alt=""
                    className="w-full h-48 object-cover rounded-xl blur-md"
                  />

                  <button
                    onClick={() => {
                      const ok = window.confirm(
                        "Verify fingerprint to view image"
                      );

                      if (ok) {
                        setUnlocked(plan.id);
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 text-white font-bold rounded-xl"
                  >
                    🔒 Unlock with Fingerprint
                  </button>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setShowModal(false)}
                className="text-red-500 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <label className="block bg-blue-600 text-white text-center py-3 rounded-xl cursor-pointer mb-3">
              Upload Main Image

              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadImage(
                      file,
                      "normal"
                    );
                  }
                }}
              />
            </label>

            <label className="block bg-red-600 text-white text-center py-3 rounded-xl cursor-pointer mb-3">
              Upload Hidden Image

              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (file) {
                    uploadImage(
                      file,
                      "hidden"
                    );
                  }
                }}
              />
            </label>

            {uploading && (
              <p className="text-center text-sm mb-3">
                Uploading...
              </p>
            )}

            <button
              onClick={async () => {
                await fetch("/api/wifi", {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    image,
                    hiddenImage,
                  }),
                });

                await loadPlans();

                setImage("");
                setHiddenImage("");
                setShowModal(false);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}