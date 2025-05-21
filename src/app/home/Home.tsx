import Image from "next/image";
import React from "react";

function HomeLayout() {
  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto">
      <div className="w-dvw h-dvh flex justify-center">
        <div className="container h-dvh flex flex-col py-6 overflow-hidden gap-4 md:gap-20">
          <header className="w-full flex items-center justify-between px-3 md:px-5 flex-shrink-0">
            <Image
              src="/images/Retify.png"
              alt="Retify AI messaging illustration"
              width={108}
              height={32}
            />
            <h3 className="text-sm font-semibold leading-[22px]">
              Coming Soon
            </h3>
          </header>
          <div className="flex flex-col flex-grow min-h-0 overflow-hidden overflow-y-auto justify-between">
            <main className="w-full flex flex-col overflow-auto">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex md:pt-20 pt-0 p-3 md:pl-5 md:pr-0 flex-col gap-6">
                  <h1 className="text-4xl md:text-[52px] md:leading-[64px] font-semibold text-left">
                    Supercharge Retail
                    <br />
                    Engagements with
                    <br />
                    AI-Driven Messaging
                  </h1>
                  <p className="text-[15px] leading-[22px] text-left">
                    Turn every chat into a sale — Retify empowers retail
                    businesses to connect, convert, and thrive.
                  </p>
                </div>
                {/* <img
                  className="max-w-[416px] max-h-[663px] p-3 md:p-0"
                  src="/images/retify_preview.png"
                  alt="Retify AI messaging illustration"
                /> */}
                <div className="relative w-full md:w-[416px] h-[663px] p-3 md:p-0">
                  <Image
                    src="/images/retify_preview.png"
                    alt="Retify AI messaging illustration"
                    fill
                    sizes="(max-width: 768px) 100vw, 416px"
                    className="object-contain p-3 md:p-0"
                    priority
                  />
                </div>
              </div>
            </main>
            <footer className="flex text-xs px-3 leading-4 font-medium justify-between items-center flex-shrink-0">
              <p>© Retify 2025</p>
              <div className="flex gap-3">
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
                <a href="#" className="hover:underline">
                  Cookie Policy
                </a>
                <a href="#" className="hover:underline">
                  Terms
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeLayout;
