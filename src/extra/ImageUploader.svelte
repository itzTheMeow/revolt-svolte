<script lang="ts">
  import { ModalStack } from "modals/ModalStack";
  import type { ExportedImageUploader } from "./ImageUploader";

  export const uploader: ExportedImageUploader = {
    trigger() {
      input.click();
    },
    onupload(cb) {
      input.addEventListener("change", () => {
        const file = input.files?.[0] || null;
        if (!file) return cb(file);
        ModalStack.push({
          type: "crop",
          file,
          done(img) {
            uploader.file = img;
            cb(img);
          },
          canceled() {
            cb(null);
          },
        });
      });
    },
    file: null,
  };

  let input: HTMLInputElement;
</script>

<input type="file" class="hidden" bind:this={input} />
