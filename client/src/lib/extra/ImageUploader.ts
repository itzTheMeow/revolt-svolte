export interface ExportedImageUploader {
	trigger(): void;
	onupload(callback: (file: File | null) => any): void;
	file: File | null;
}
