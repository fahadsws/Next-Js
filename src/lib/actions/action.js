    'use server';
    import fs from 'fs/promises';
    import path from 'path';
    async function saveFile(file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, file.name);
      await fs.writeFile(filePath, buffer);
      return { message: 'File uploaded successfully', filePath: `/uploads/${file.name}` };
    }
    export async function uploadFile(formData) {
      const file = formData.get('file');
      if (!file) {
        return { message: 'No file received' };
      }
      return await saveFile(file);
    }