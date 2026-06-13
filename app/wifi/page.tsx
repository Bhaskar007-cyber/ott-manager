"use client";

import { useEffect, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { startAuthentication } from "@simplewebauthn/browser";
import { ShieldCheck } from "lucide-react";
import { Plus } from "lucide-react";
import { Fingerprint } from "lucide-react";


type WifiPlan = {
  id: number;
  image: string;
  hiddenImage?: string;
};

export default function WifiPage() {
  const [plans, setPlans] = useState<WifiPlan[]>([]);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] =
  useState<string | null>(null);

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
<div className="
min-h-screen
bg-[#f8f5ff]
p-5
">
      <div className="mb-8">

 <h1
  className="
  text-[10px]
  font-black
  tracking-tight
  leading-none
  text-slate-900
"
>
  WiFi Plans
</h1>
  <p className="
  text-gray-500
  
  mt-1
  ">
    Manage and create WiFi broadband plans
  </p>



  <div className="flex gap-4 mt-2">

    <button
  className="
  flex items-center justify-center gap-3
  h-12
  px-6
  rounded-[16px]
  bg-gradient-to-r
  from-[#06B63C]
  to-[#14C94A]
  text-white
  font-semibold
  shadow-lg
  "
>
  <ShieldCheck size={22} strokeWidth={2.5} />
  Passkey
</button>

    <button
    
  className="
  flex items-center justify-center gap-3
  h-12
  px-6
  rounded-[16px]
  bg-gradient-to-r
  from-[#5B5FFB]
  via-[#6C63FF]
  to-[#7B61FF]
  text-white
  font-semibold
  shadow-lg
  relative overflow-hidden
  "
>
  <Plus size={24} strokeWidth={2.5} />
  Plan
</button>

  </div>

</div>

      <div className="space-y-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="
relative
bg-white
rounded-[34px]
p-3
shadow-[0_12px_40px_rgba(0,0,0,0.08)]
border
border-white
overflow-hidden
"
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
                <div className="flex flex-col gap-1">
  <div className="w-1 h-1 bg-slate-900 rounded-full" />
  <div className="w-1 h-1 bg-slate-900 rounded-full" />
  <div className="w-1 h-1 bg-slate-900 rounded-full" />
</div>
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
  onClick={() =>
    setPreviewImage(plan.image)
  }
  className="
w-full
rounded-[28px]
object-cover
cursor-pointer
"
/>
            )}

            {/* HIDDEN IMAGE */}
            {plan.hiddenImage &&
              (unlocked === plan.id ? (
  <img
  src={plan.hiddenImage}
  alt=""
  onClick={() =>
    setPreviewImage(plan.hiddenImage!)
  }
  className="
w-full
rounded-[24px]
object-cover
cursor-pointer
"
/>
) : (
                <div className="
relative
mt-4
rounded-[28px]
overflow-hidden
bg-gradient-to-br
from-[#faf7ff]
to-[#f4eeff]
border
border-[#ede9fe]
">

  <img
    src={plan.hiddenImage}
    alt=""
    className="
    w-full
    rounded-[28px]
    blur-xl
    opacity-40
    scale-105
    "
  />

  <div className="
  absolute
  inset-0
  flex
  flex-col
  items-center
  justify-center
  ">

    <div className="relative mb-8">

  <div className="absolute inset-0 rounded-full border border-purple-200 scale-[1.5]" />

  <div className="absolute inset-0 rounded-full border border-purple-100 scale-[1.9]" />

  <div
    className="
    relative
    w-10
    h-10
    rounded-full
    bg-white
    shadow-xl
    flex
    items-center
    justify-center
    "
  >
    <div className="text-5xl">
      🔒
    </div>
  </div>

</div>
    <h3 className="
    text-2xl
    font-bold
    text-slate-900
    ">
      Unlock with Fingerprint
    </h3>

    <p className="
    text-gray-500
    mt-2
    mb-5
    ">
      Authenticate to view WiFi details
    </p>

    <button
      onClick={async () => {
        try {
          const options = await fetch("/api/auth/login-start")
            .then((r) => r.json());

          const authResp =
            await startAuthentication({
              optionsJSON: options,
            });

          const verify = await fetch(
            "/api/auth/login-finish",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(authResp),
            }
          );

          const result = await verify.json();

          if (result.verified) {
            setUnlocked(plan.id);
          }
        } catch {
          alert("Authentication failed");
        }
      }}
      className="
  h-14
  w-[150px]
  mx-auto
  rounded-[18px]
  bg-gradient-to-r
  from-[#6C4CF5]
  via-[#7558FF]
  to-[#7B61FF]
  text-white
  font-semibold
  shadow-lg
  flex
  items-center
  justify-center
  gap-2
  "
>
  <Fingerprint size={20} />
  <span>Authenticate</span>
</button>

  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {previewImage && (
  <div
    className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4"
    onClick={() =>
      setPreviewImage(null)
    }
  >
    <img
      src={previewImage}
      alt=""
      className="max-w-full max-h-[90vh] rounded-xl"
      onClick={(e) =>
        e.stopPropagation()
      }
    />
  </div>
)}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="
bg-white
p-7
rounded-[32px]
w-[95%]
max-w-md
shadow-[0_20px_60px_rgba(0,0,0,0.15)]
"
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