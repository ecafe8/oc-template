"use client";

// import { toAbsoluteUrl } from "@repo/share-frontend/utils/url";
import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@repo/share-ui/components/reui/alert";
import { Button } from "@repo/share-ui/components/reui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/share-ui/components/reui/dialog";
import { ScrollArea } from "@repo/share-ui/components/reui/scroll-area";
import {
  type FileMetadata,
  type FileUploadOptions,
  type FileWithPreview,
  useFileUpload,
} from "@repo/share-ui/hooks/use-file-upload";
import { cn } from "@repo/share-ui/utils";
import { formatBytes } from "@repo/share-ui/utils/number";
import { ImageIcon, TriangleAlert, Upload, XIcon, ZoomInIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { LuFile } from "react-icons/lu";

interface FilesUploadProps extends FileUploadOptions {
  className?: string;
}

export default function FilesUpload({ className, ...options }: FilesUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { maxFiles = 10, maxSize = 5 * 1024 * 1024, accept = "image/*", multiple = true } = options;

  const [
    { files, isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    ...options,
    maxFiles,
    maxSize,
    accept,
    multiple,
  });

  const isImage = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type;
    return type.startsWith("image/");
  };

  return (
    <div className={cn(className, "flex flex-col overflow-hidden")}>
      {/* Upload Area */}
      <section
        className={cn(
          "relative rounded-lg border border-dashed p-8 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        aria-label="upload files"
      >
        <input {...getInputProps()} className="sr-only" />

        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              isDragging ? "bg-primary/10" : "bg-muted",
            )}
          >
            <ImageIcon className={cn("h-5 w-5", isDragging ? "text-primary" : "text-muted-foreground")} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload images to gallery</h3>
            <p className="text-sm text-muted-foreground">Drag and drop images here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to {formatBytes(maxSize)} each (max {maxFiles} files)
            </p>
          </div>

          <Button onClick={openFileDialog}>
            <Upload className="h-4 w-4" />
            Select images
          </Button>
        </div>
      </section>

      {/* Gallery Stats */}
      {files.length > 0 && (
        <div className="mt-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="text-sm font-medium">
              Files ({files.length}/{maxFiles})
            </h4>
            <div className="text-xs text-muted-foreground">
              Total: {formatBytes(files.reduce((acc, file) => acc + file.file.size, 0))}
            </div>
          </div>
          <Button onClick={clearFiles} variant="outline" size="sm">
            Clear all
          </Button>
        </div>
      )}

      {/* Image Grid */}
      <div className="relative max-h-25">
        <ScrollArea className="h-full">
          <div className="h-full">
            {files.length > 0 && (
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-4">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="group relative aspect-square">
                    {isImage(fileItem.file) && fileItem.preview ? (
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="h-full w-full rounded-lg border object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg border bg-muted">
                        <LuFile className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {/* View Button */}
                      {isImage(fileItem.file) && fileItem.preview && (
                        <Button
                          // biome-ignore lint/style/noNonNullAssertion: <https://reui.io/docs/alert>
                          onClick={() => setSelectedImage(fileItem.preview!)}
                          variant="secondary"
                          size="icon"
                          className="size-6 absolute top-2 start-2 p-0"
                        >
                          <ZoomInIcon className="opacity-100/80" />
                        </Button>
                      )}

                      {/* Remove Button */}
                      <Button
                        onClick={() => removeFile(fileItem.id)}
                        variant="secondary"
                        size="icon"
                        className="size-6 absolute top-2 end-2 p-0"
                      >
                        <XIcon className="opacity-100/80" />
                      </Button>
                    </div>

                    {/* File Info */}
                    <div className="absolute bottom-0 left-0 right-0 rounded-lg bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-xs font-medium">{fileItem.file.name}</p>
                      <p className="text-xs text-gray-300">{formatBytes(fileItem.file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" appearance="light" className="mt-5">
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p key={index} className="last:mb-0">
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-full max-w-full">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              onClick={() => setSelectedImage(null)}
              variant="secondary"
              size="icon"
              className="absolute end-2 top-2 size-7 p-0"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilesUploadDialogProps extends FilesUploadProps {
  trigger?: React.ReactNode;
}
export function FilesUploadDialog(props: FilesUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const { trigger = <Button variant="outline">Show Dialog</Button> } = props;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md" variant="lg">
        <DialogHeader>
          <DialogTitle>Select Files</DialogTitle>
          <DialogDescription>Select files to upload.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FilesUpload {...props} />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
          <Button type="submit">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
