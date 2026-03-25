"use client";

import { useGetAllGalleryQuery } from "@/redux/api/authApi";
import Image from "next/image";

export default function Gallery() {
  const { data: allGallery } = useGetAllGalleryQuery(undefined);
  const galleries = allGallery?.result || [];

  return (
    <div className="p-8 space-y-12">
      <h2 className="text-2xl font-semibold mb-6">Gallery Images</h2>

      {galleries.map((gallery: any) => (
        <div
          key={gallery.id}
          className="space-y-6  p-6 bg-white rounded-xl  transition hover:shadow-sm"
        >
          <div className="flex gap-6">
            {/* Before Images - Left Side */}
            <div className="flex flex-col gap-4 flex-1">
              {gallery.beforePhotos?.length ? (
                gallery.beforePhotos.map((img: string, index: number) => (
                  <div
                    key={index}
                    className="relative w-full h-60 rounded-md overflow-hidden bg-gray-200"
                  >
                    <Image
                      src={img}
                      alt={`Before Image ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-lg">
                      Before
                    </span>
                  </div>
                ))
              ) : (
                <div className="relative w-full h-60 rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">
                    No Before Images
                  </span>
                </div>
              )}
            </div>

            {/* After Images - Right Side */}
            <div className="flex flex-col gap-4 flex-1">
              {gallery.afterPhotos?.length ? (
                gallery.afterPhotos.map((img: string, index: number) => (
                  <div
                    key={index}
                    className="relative w-full h-60 rounded-md overflow-hidden bg-gray-200"
                  >
                    <Image
                      src={img}
                      alt={`After Image ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-lg">
                      After
                    </span>
                  </div>
                ))
              ) : (
                <div className="relative w-full h-60 rounded-md bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">No After Images</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
