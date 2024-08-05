"use client";

import { useState, useEffect } from "react";
import useCart from "@/lib/hooks/useCart";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUpload from "@/components/custom ui/ImageUpload";
import { updateProductInventory } from "@/lib/actions/actions"; // Import the update inventory action

const Checkout = () => {
  const router = useRouter();
  const { user } = useUser();
  const cart = useCart();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [totalRounded, setTotalRounded] = useState(0);

  useEffect(() => {
    const calculateTotal = () => {
      const total = cart.cartItems.reduce(
        (acc, item) => acc + item.item.price * item.quantity,
        0
      );
      setTotalRounded(Math.round(total));
    };

    calculateTotal();
  }, [cart.cartItems]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleCheckout = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     if (!user) {
  //       router.push("sign-in");
  //     } else {
  //       const customer = {
  //         clerkId: user?.id,
  //         email: user?.emailAddresses[0].emailAddress,
  //         name: user?.fullName,
  //       };

  //       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
  //         method: "POST",
  //         body: JSON.stringify({
  //           cartItems: cart.cartItems,
  //           customer,
  //           formData,
  //           uploadedImages,
  //         }),
  //       });

  //       const data = await res.json();
  //       if (data.success) {
  //         // Deduct inventory for each item in the cart
  //         for (const cartItem of cart.cartItems) {
  //           if (cartItem.size) { // Ensure size is defined before calling updateProductInventory
  //             await updateProductInventory(cartItem.item._id, cartItem.quantity, cartItem.size);
  //           }
  //         }

  //         cart.clearCart();
  //         router.push("/payment_success");
  //       } else {
  //         console.error(data.message);
  //       }
  //     }
  //   } catch (err) {
  //     console.log("[checkout_POST]", err);
  //   }
  // };

  // app/(root)/checkout/page.tsx
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) {
        router.push("sign-in");
      } else {
        const customer = {
          clerkId: user?.id,
          email: user?.emailAddresses[0].emailAddress,
          name: user?.fullName,
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
          method: "POST",
          body: JSON.stringify({
            cartItems: cart.cartItems,
            customer,
            formData,
            uploadedImages,
          }),
        });

        const data = await res.json();
        if (data.success) {
          // Deduct inventory for each item in the cart
          for (const cartItem of cart.cartItems) {
            await updateProductInventory(
              cartItem.item._id,
              cartItem.quantity,
              cartItem.size!
            );
          }

          cart.clearCart();
          router.push("/payment_success");
        } else {
          console.error(data.message);
        }
      }
    } catch (err) {
      console.log("[checkout_POST]", err);
    }
  };

  const handleImageChange = (url: string) => {
    setUploadedImages([...uploadedImages, url]);
  };

  const handleImageRemove = (url: string) => {
    setUploadedImages(uploadedImages.filter((image) => image !== url));
  };

  return (
    <div className="flex gap-20 py-16 px-10 max-lg:flex-col max-sm:px-3 font-notosanslao">
      <div className="w-1/3 max-lg:w-full flex flex-col  bg-white rounded-lg gap-6 px-4 py-5">
        <p className="text-heading3-bold text-center">
        ຈຳນວນສິນຄ້າທັງໝົດ{" "}
          <span>{`(${cart.cartItems.length} ${
            cart.cartItems.length > 1 ? "items" : "item"
          })`}</span>
        </p>
        {cart.cartItems.map((cartItem) => (
          <div
            key={cartItem.item._id}
            className="w-full border-2 flex max-sm:flex-col max-sm:gap-3 px-4 py-3 items-center max-sm:items-start justify-between rounded-lg"
          >
            <div className="flex items-center">
              <Image
                src={cartItem.item.media[0]}
                width={100}
                height={100}
                className="rounded-lg w-32 h-32 object-cover"
                alt="product"
              />
              <div className="flex flex-col gap-3 ml-4">
                <p className="text-body-bold">{cartItem.item.title}</p>
                {cartItem.color && (
                  <p className="text-small-medium">{cartItem.color}</p>
                )}
                {cartItem.size && (
                  <p className="text-small-medium">{cartItem.size}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <p className="text-body-small">ຈຳນວນ: {cartItem.quantity}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-between text-body-semibold">
          <span>ລາຄາ</span>
          <span>₭{totalRounded}</span>
        </div>
      </div>

      <div className="w-1/3 max-lg:w-full rounded-lg border-2 px-4 py-5">
        <p className="text-heading3-bold text-center">ສະແກນເພື່ອຊຳລະເງິນ</p>
        <hr className="my-6" />
        <Image
          src="/BCEL.jpg"
          width={100}
          height={100}
          layout="responsive"
          className="rounded-lg object-cover"
          alt="BCEL"
        />
      </div>

      <div className="w-1/3 max-lg:w-full rounded-lg border-2 px-4 py-5">
        <p className="text-heading3-bold text-center">ທີ່ຢູ່ບ່ອນຈັດສົ່ງ</p>
        <hr className="my-6" />

        <form onSubmit={handleCheckout}>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="ຊື່ ແລະ ນາມສະກຸນ"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="ອີເມວ"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="ທີ່ຢູ່ປັດຈຸບັນ"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="postalCode"
              placeholder="ເບີໂທລະສັບ"
              value={formData.postalCode}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="country"
              placeholder="ລາຍລະອຽດຂົນສົ່ງ: ຮຸ່ງອາລຸນ(ສາຂາ ຈິນາຍໂມ້)/ເມືອງສີສັດຕະນາກ/ນະຄອນຫຼວງວຽງຈັນ"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>

          <hr className="my-6" />

          <p>ຢືນຢັນສະຖານະການຊຳລະເງິນ</p>

          <ImageUpload
            value={uploadedImages}
            onChange={handleImageChange}
            onRemove={handleImageRemove}
          />

          <button
            type="submit"
            className="border rounded-lg text-body-bold bg-white py-3 w-full hover:bg-black hover:text-white mt-6"
          >
            ສັ່ງຊື້
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
