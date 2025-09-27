import React, { useState } from "react";
import { useContract } from "../hooks/useContract";
import { lighthouseUtils } from "../utils/lighthouse";
import type { CreatePostParams } from "../types/contract";
import { Button } from "./ui/button";

export const SimpleCreatePost: React.FC = () => {
  const { createPost, isLoading, error } = useContract();
  const [formData, setFormData] = useState<CreatePostParams>({
    ipfsHash: "",
    title: "",
    description: "",
  });
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    // Validate IPFS hash format using Lighthouse utilities
    if (!lighthouseUtils.isValidIPFSHash(formData.ipfsHash)) {
      alert("Please enter a valid IPFS hash (starts with Qm or bafy)");
      return;
    }

    try {
      const tokenId = await createPost(formData, (id) => {
        setSuccess(`Post created successfully! Token ID: ${id}`);
        setFormData({ ipfsHash: "", title: "", description: "" });
      });

      console.log("Post created with token ID:", tokenId);
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div
      className="rounded-[100px] flex w-full max-w-5xl h-full max-h-[800px] mx-auto overflow-y-auto"
      style={{
        boxShadow:
          "0 4px 24px 8px rgba(0,0,0,0.05), inset 0 1px 6px 0 rgba(0,0,0,0.08), inset 0 -1px 6px 0 rgba(0,0,0,0.05)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="flex-1 p-12 py-16 flex flex-col rounded-[100px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255) 0%, rgba(230,245,255,0.7) 100%)",
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-card-foreground">
          Create New Post (Simple Mode)
        </h2>

        <div className="mb-4 p-4 bg-secondary/20 rounded-lg border border-secondary/30">
          <h3 className="text-sm font-medium text-secondary-foreground mb-2">
            📝 Simple Mode Instructions:
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              This mode allows you to create posts without direct IPFS upload
            </li>
            <li>You need to provide an existing IPFS hash for your content</li>
            <li>
              Use a test hash like:{" "}
              <code className="bg-muted px-1 rounded font-mono text-xs">
                QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
              </code>
            </li>
            <li>
              Or upload your content to IPFS manually and paste the hash here
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="mb-6 p-6 rounded-3xl"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(230,245,255,0.5) 100%)",
              boxShadow:
                "0 4px 16px 4px rgba(0,0,0,0.03), inset 0 1px 4px 0 rgba(255,255,255,0.4)",
              backdropFilter: "blur(4px)",
            }}
          >
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Post Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
              placeholder="Enter a catchy title for your post"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-foreground placeholder:text-muted-foreground"
              placeholder="Describe your post, share your thoughts, or tell a story..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="ipfsHash"
              className="block text-sm font-medium text-foreground mb-2"
            >
              IPFS Hash *
            </label>
            <input
              type="text"
              id="ipfsHash"
              name="ipfsHash"
              value={formData.ipfsHash}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a valid IPFS hash (Qm... or bafy...)
            </p>

            <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-foreground mb-2">
                <strong>Test IPFS Hashes:</strong>
              </p>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      ipfsHash:
                        "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
                    }))
                  }
                  className="block text-xs font-mono h-auto py-1 px-2 w-full justify-start"
                >
                  QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG (IPFS Logo)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      ipfsHash:
                        "QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq",
                    }))
                  }
                  className="block text-xs font-mono h-auto py-1 px-2 w-full justify-start"
                >
                  QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq (Test Image)
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full py-4 font-semibold transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Post on Blockchain...</span>
              </div>
            ) : (
              "Create Post"
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-primary/10 border border-primary/20 text-primary rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
          <h4 className="text-sm font-medium text-accent-foreground mb-2">
            🚀 Upgrade to Full Lighthouse Upload
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            This simple mode works with existing IPFS hashes. For full image
            upload functionality, you already have Lighthouse configured! The
            app will automatically switch to full mode.
          </p>
          <div className="text-xs text-muted-foreground">
            <strong>Lighthouse Benefits:</strong> Permanent storage • Pay once,
            store forever • Decentralized • Fast retrieval
          </div>
        </div>
      </div>
    </div>
  );
};
