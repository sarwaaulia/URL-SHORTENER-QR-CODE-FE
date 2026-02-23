import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { supabase } from '../config/supabase';

export const downloadQrPng = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: link, error } = await supabase
      .from('links')
      .select('short_code')
      .eq('id', id)
      .single();

    if (error || !link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    const shortUrl = `${process.env.BASE_URL}/${link.short_code}`;

    // Generate QR dynamically
    const qrBuffer = await QRCode.toBuffer(shortUrl, {
      type: 'png',
      width: 512,
      margin: 2
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-${link.short_code}.png"`
    );

    res.send(qrBuffer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
};
