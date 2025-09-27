import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  MapPin,
  Upload,
  DollarSign,
  Sparkles,
  FileText,
  Image,
  AlertCircle,
  X,
  UploadIcon,
  ImageIcon,
} from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const maxSizeMB = 10;
  const maxSize = maxSizeMB * 1024 * 1024; // 10MB per image

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/gif",
    maxSize,
    multiple: true,
  });

  const categories = [
    "River Cleaning",
    "Beach Cleanup",
    "Animal Care",
    "Infrastructure Repair",
    "Waste Management",
    "Tree Planting",
    "Community Garden",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setIsUploading(false);
    // Handle successful submission
    alert("Post created successfully! NFT is being minted...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pt-32">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Social Impact Post
              </h1>
              <p className="text-gray-600">
                Share your good deed and mint it as an NFT
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cleaned Riverside Park today!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you did, how it helped, and any interesting details..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Central Park, New York, NY"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Image Upload - Updated Component */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos/Evidence *
                </label>
                <div className="flex flex-col gap-2">
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
                  >
                    <input
                      {...getInputProps()}
                      className="sr-only"
                      aria-label="Upload image files"
                    />
                    <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                      <div
                        className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                      >
                        <ImageIcon className="size-4 opacity-60" />
                      </div>
                      <p className="mb-1.5 text-sm font-medium">
                        Drop your images here
                      </p>
                      <p className="text-muted-foreground text-xs">
                        PNG, JPG or GIF (max. {maxSizeMB}MB each)
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={openFileDialog}
                      >
                        <UploadIcon
                          className="-ms-1 size-4 opacity-60"
                          aria-hidden="true"
                        />
                        Select images
                      </Button>
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div
                      className="text-destructive flex items-center gap-1 text-xs"
                      role="alert"
                    >
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{errors[0]}</span>
                    </div>
                  )}

                  {/* Preview uploaded images */}
                  {files.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <div key={file.id} className="relative">
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 z-50 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                            onClick={() => removeFile(file.id)}
                            aria-label="Remove image"
                          >
                            <X className="size-3" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isUploading ||
                  !title ||
                  !description ||
                  !category ||
                  files.length === 0
                }
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-lg font-semibold"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Post & Minting NFT...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Post & Mint NFT
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Sidebar Info - Unchanged */}
          <div className="space-y-6">
            {/* Process Steps */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What happens next?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AI Analysis</p>
                    <p className="text-sm text-gray-600">
                      Your images will be analyzed and labeled by AI
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">NFT Minting</p>
                    <p className="text-sm text-gray-600">
                      Your post will be minted as a unique NFT
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">IPFS Storage</p>
                    <p className="text-sm text-gray-600">
                      Metadata stored permanently on IPFS
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Community Sharing
                    </p>
                    <p className="text-sm text-gray-600">
                      Your post goes live for likes and cheers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200 p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                💡 Tips for Better Posts
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Include before and after photos when possible</li>
                <li>
                  • Be specific about your impact (e.g., "20 pounds of trash")
                </li>
                <li>• Add location for better dataset value</li>
                <li>• Clear, well-lit photos get better AI labels</li>
                <li>• Authentic stories get more community support</li>
              </ul>
            </div>

            {/* Earnings Info */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                <DollarSign className="w-5 h-5 inline mr-2" />
                Earning Potential
              </h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Cheers from community:</span>
                  <span className="font-semibold">$0 - $100+</span>
                </div>
                <div className="flex justify-between">
                  <span>Dataset revenue share:</span>
                  <span className="font-semibold">$5 - $50/year</span>
                </div>
                <div className="flex justify-between">
                  <span>NFT potential value:</span>
                  <span className="font-semibold">Variable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
