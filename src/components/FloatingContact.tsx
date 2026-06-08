"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [productInfo, setProductInfo] = useState("");
  const pathname = usePathname();

  const phoneNumber = process.env.NEXT_PUBLIC_BKASH_NUMBER || "01842332856";
  const messengerLink = "#"; // TODO: Provide Messenger link later

  useEffect(() => {
    // Check if the user is on a product details page
    if (pathname && pathname.startsWith("/products/")) {
      // Use a slight delay to ensure the DOM is fully hydrated/rendered
      setTimeout(() => {
        const title = document.title;
        // The product details page uses an <h1> for the product name
        const h1 = document.querySelector("h1")?.innerText;
        const productName = h1 || title || "এই পণ্যটি";
        const url = window.location.href;
        
        const message = `হ্যালো! আমি এই প্রোডাক্টটি সম্পর্কে জানতে চাই:\n\n*${productName}*\n${url}`;
        setProductInfo(encodeURIComponent(message));
      }, 500);
    } else {
      // Default message for other pages
      setProductInfo(encodeURIComponent("হ্যালো! আমি কিছু তথ্য জানতে চাই।"));
    }
  }, [pathname]);

  // Ensure Bangladesh country code (+88) is added if not present
  const formattedPhone = phoneNumber.startsWith("0") ? `88${phoneNumber}` : phoneNumber;
  const whatsappLink = `https://wa.me/${formattedPhone}?text=${productInfo}`;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Contact Options (Animated) */}
      <div 
        className={`flex flex-col gap-3 transition-all duration-300 origin-bottom ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {/* Call Option */}
        <a 
          href={`tel:${phoneNumber}`} 
          className="w-12 h-12 rounded-full bg-white text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title="কল করুন"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>

        {/* Messenger Option */}
        {/* <a 
          href={messengerLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform overflow-hidden"
          title="মেসেঞ্জার"
          onClick={(e) => {
            if (messengerLink === "#") {
              e.preventDefault();
              alert("Messenger link is not set yet!");
            }
          }}
        >
          <Image src="/messenger.svg" alt="Messenger" width={32} height={32} className="object-contain" />
        </a> */}

        {/* WhatsApp Option */}
        <a 
          href={whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#ffffff] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title="হোয়াটসঅ্যাপ"
        >
          <Image src="/whatsapp.svg" alt="WhatsApp" width={28} height={28} className="object-contain" />
        </a>
      </div>

      {/* Main Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="w-14 h-14 rounded-full bg-teal-500 text-ocean-950 flex items-center justify-center shadow-xl shadow-teal-500/20 hover:bg-teal-400 transition-colors glow-teal cursor-pointer"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7 fill-ocean-950" />}
      </button>
    </div>
  );
}
