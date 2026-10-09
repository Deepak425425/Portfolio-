/**
 * Video Metadata Inspection and In-Place Container Scrubbing Utility
 * Supports ISO-BMFF (MP4, MOV, M4V) with zero re-encoding (100% lossless stream preservation).
 */

export interface DetectedMetadataField {
  id: string;
  tagType?: string;
  category: 'timestamp' | 'tag' | 'gps' | 'device' | 'xmp';
  label: string;
  value: string;
  removable: boolean;
  description: string;
}

export interface TechnicalVideoProperties {
  format: string;
  majorBrand: string;
  compatibleBrands: string[];
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  hasAudioTrack: boolean;
  hasVideoTrack: boolean;
}

export interface ParsedVideoMetadata {
  isSupportedFormat: boolean;
  formatName: string;
  technical: TechnicalVideoProperties;
  fields: DetectedMetadataField[];
}

export interface VerificationResult {
  verified: boolean;
  remainingSelectedCount: number;
  remainingFields: DetectedMetadataField[];
  message: string;
}

// Convert MP4 epoch (Jan 1, 1904) to Unix timestamp
const MP4_EPOCH_OFFSET = 2082844800;

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function parseVideoMetadata(buffer: ArrayBufferLike): ParsedVideoMetadata {
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  const view = new DataView(buffer as ArrayBuffer);

  const technical: TechnicalVideoProperties = {
    format: 'MP4 / QuickTime Container',
    majorBrand: 'Unknown',
    compatibleBrands: [],
    fileSize: bytes.length,
    hasAudioTrack: false,
    hasVideoTrack: false,
  };

  const fields: DetectedMetadataField[] = [];

  let offset = 0;
  let isIsoBmff = false;

  while (offset + 8 <= bytes.length) {
    const size = view.getUint32(offset);
    if (size < 8) break;
    const type = String.fromCharCode(
      bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]
    );

    if (type === 'ftyp') {
      isIsoBmff = true;
      const brand = String.fromCharCode(
        bytes[offset + 8], bytes[offset + 9], bytes[offset + 10], bytes[offset + 11]
      ).trim();
      technical.majorBrand = brand || 'isom';
      technical.format = `ISO Base Media (${brand || 'mp4'})`;
    }

    if (type === 'moov') {
      const moovEnd = offset + size;
      let childOffset = offset + 8;

      while (childOffset + 8 <= moovEnd) {
        const childSize = view.getUint32(childOffset);
        if (childSize < 8) break;
        const childType = String.fromCharCode(
          bytes[childOffset + 4], bytes[childOffset + 5], bytes[childOffset + 6], bytes[childOffset + 7]
        );

        if (childType === 'mvhd') {
          const version = view.getUint8(childOffset + 8);
          let cTime = 0;
          let mTime = 0;
          if (version === 0) {
            cTime = view.getUint32(childOffset + 12);
            mTime = view.getUint32(childOffset + 16);
          } else if (version === 1) {
            cTime = Number(view.getBigUint64(childOffset + 12));
            mTime = Number(view.getBigUint64(childOffset + 20));
          }

          if (cTime > 0) {
            const dateStr = new Date((cTime - MP4_EPOCH_OFFSET) * 1000).toLocaleString();
            fields.push({
              id: 'creation_time',
              category: 'timestamp',
              label: 'Container Creation Time',
              value: dateStr,
              removable: true,
              description: 'Date and time the movie container was generated.'
            });
          }

          if (mTime > 0) {
            const dateStr = new Date((mTime - MP4_EPOCH_OFFSET) * 1000).toLocaleString();
            fields.push({
              id: 'modification_time',
              category: 'timestamp',
              label: 'Container Modification Time',
              value: dateStr,
              removable: true,
              description: 'Date and time the video file was last modified or exported.'
            });
          }
        }

        if (childType === 'udta') {
          let udtaOffset = childOffset + 8;
          const udtaEnd = childOffset + childSize;

          while (udtaOffset + 8 <= udtaEnd) {
            const uSize = view.getUint32(udtaOffset);
            if (uSize < 8) break;
            const uType = String.fromCharCode(
              bytes[udtaOffset + 4], bytes[udtaOffset + 5], bytes[udtaOffset + 6], bytes[udtaOffset + 7]
            );

            if (uType === 'meta') {
              let metaOffset = udtaOffset + 12;
              const metaEnd = udtaOffset + uSize;

              while (metaOffset + 8 <= metaEnd) {
                const mSize = view.getUint32(metaOffset);
                if (mSize < 8) break;
                const mType = String.fromCharCode(
                  bytes[metaOffset + 4], bytes[metaOffset + 5], bytes[metaOffset + 6], bytes[metaOffset + 7]
                );

                if (mType === 'ilst') {
                  let ilstOffset = metaOffset + 8;
                  const ilstEnd = metaOffset + mSize;

                  while (ilstOffset + 8 <= ilstEnd) {
                    const iSize = view.getUint32(ilstOffset);
                    if (iSize < 8) break;
                    const iType = String.fromCharCode(
                      bytes[ilstOffset + 4], bytes[ilstOffset + 5], bytes[ilstOffset + 6], bytes[ilstOffset + 7]
                    );

                    // Skip padding/free atoms
                    if (iType === 'free') {
                      ilstOffset += iSize;
                      continue;
                    }

                    let tagValue = '';
                    const dataOffset = ilstOffset + 8;
                    if (dataOffset + 8 <= ilstOffset + iSize) {
                      const dataSize = view.getUint32(dataOffset);
                      const dataType = String.fromCharCode(
                        bytes[dataOffset + 4], bytes[dataOffset + 5], bytes[dataOffset + 6], bytes[dataOffset + 7]
                      );
                      if (dataType === 'data') {
                        const valBytes = bytes.slice(dataOffset + 16, dataOffset + dataSize);
                        tagValue = new TextDecoder().decode(valBytes).replace(/[^\x20-\x7E]/g, '').trim();
                      }
                    }

                    const tagDefinitions: Record<string, { label: string, category: DetectedMetadataField['category'], description: string }> = {
                      '©nam': { label: 'Video Title', category: 'tag', description: 'Embedded project or video title' },
                      '©art': { label: 'Artist / Author', category: 'tag', description: 'Creator or artist name' },
                      '©alb': { label: 'Album / Project', category: 'tag', description: 'Project collection or album identifier' },
                      '©day': { label: 'Release / Creation Date', category: 'timestamp', description: 'Year or calendar date embedded in metadata' },
                      '©too': { label: 'Encoder / Software', category: 'device', description: 'Software or encoding library used to generate the video' },
                      '©cmt': { label: 'Comment / Notes', category: 'tag', description: 'User notes or software comments' },
                      '©des': { label: 'Description', category: 'tag', description: 'Embedded summary or synopsis' },
                      '©xyz': { label: 'GPS Coordinates', category: 'gps', description: 'Geographical location recorded by camera or smartphone' },
                      'cprt': { label: 'Copyright Notice', category: 'tag', description: 'Legal ownership or copyright attribution' },
                      '©cpy': { label: 'Copyright', category: 'tag', description: 'Embedded copyright notice' },
                      'make': { label: 'Camera Manufacturer', category: 'device', description: 'Device hardware manufacturer' },
                      'modl': { label: 'Camera Model', category: 'device', description: 'Device model number or name' },
                      'loc ': { label: 'Location Data', category: 'gps', description: 'Geographical recording location' }
                    };

                    const def = tagDefinitions[iType] || {
                      label: `Metadata Tag (${iType})`,
                      category: 'tag',
                      description: 'QuickTime/iTunes metadata atom'
                    };

                    fields.push({
                      id: `tag_${iType}`,
                      tagType: iType,
                      category: def.category,
                      label: def.label,
                      value: tagValue || '(Present in container)',
                      removable: true,
                      description: def.description
                    });

                    ilstOffset += iSize;
                  }
                }

                metaOffset += mSize;
              }
            } else if (uType === 'XMP_') {
              fields.push({
                id: 'xmp_packet',
                category: 'xmp',
                label: 'Embedded XMP Data Packet',
                value: `Adobe / Camera XMP Packet (${formatBytes(uSize)})`,
                removable: true,
                description: 'Full XML schema containing camera hardware info, edit history, and telemetry.'
              });
            } else if (uType === '©xyz' || uType === 'loc ') {
              fields.push({
                id: 'gps_udta',
                category: 'gps',
                label: 'GPS Geotag Atom',
                value: 'Embedded Geographical Coordinate Atom',
                removable: true,
                description: 'Smartphone or camera GPS location data in user data atom.'
              });
            }

            udtaOffset += uSize;
          }
        }

        if (childType === 'trak') {
          let trakChildOffset = childOffset + 8;
          const trakEnd = childOffset + childSize;

          while (trakChildOffset + 8 <= trakEnd) {
            const tSize = view.getUint32(trakChildOffset);
            if (tSize < 8) break;
            const tType = String.fromCharCode(
              bytes[trakChildOffset + 4], bytes[trakChildOffset + 5], bytes[trakChildOffset + 6], bytes[trakChildOffset + 7]
            );

            if (tType === 'tkhd') {
              const version = view.getUint8(trakChildOffset + 8);
              let cTime = 0;
              if (version === 0) cTime = view.getUint32(trakChildOffset + 12);
              else if (version === 1) cTime = Number(view.getBigUint64(trakChildOffset + 12));

              if (cTime > 0 && !fields.find(f => f.id === 'track_timestamps')) {
                fields.push({
                  id: 'track_timestamps',
                  category: 'timestamp',
                  label: 'Track Header Timestamps',
                  value: 'Video / Audio Track creation timestamps',
                  removable: true,
                  description: 'Internal track clocks embedded in tkhd atoms.'
                });
              }
            }

            if (tType === 'mdia') {
              let mdiaChildOffset = trakChildOffset + 8;
              const mdiaEnd = trakChildOffset + tSize;
              while (mdiaChildOffset + 8 <= mdiaEnd) {
                const mSize = view.getUint32(mdiaChildOffset);
                if (mSize < 8) break;
                const mType = String.fromCharCode(
                  bytes[mdiaChildOffset + 4], bytes[mdiaChildOffset + 5], bytes[mdiaChildOffset + 6], bytes[mdiaChildOffset + 7]
                );
                if (mType === 'hdlr') {
                  const handlerType = String.fromCharCode(
                    bytes[mdiaChildOffset + 16], bytes[mdiaChildOffset + 17], bytes[mdiaChildOffset + 18], bytes[mdiaChildOffset + 19]
                  );
                  if (handlerType === 'vide') technical.hasVideoTrack = true;
                  if (handlerType === 'soun') technical.hasAudioTrack = true;
                }
                mdiaChildOffset += mSize;
              }
            }

            trakChildOffset += tSize;
          }
        }

        childOffset += childSize;
      }
    }

    if (type === 'uuid') {
      fields.push({
        id: 'uuid_metadata',
        category: 'device',
        label: 'Device Telemetry / UUID Block',
        value: `Custom Device Extension (${formatBytes(size)})`,
        removable: true,
        description: 'Vendor-specific maker notes (Sony, GoPro, DJI drone telemetry, or Canon extensions).'
      });
    }

    offset += size;
  }

  return {
    isSupportedFormat: isIsoBmff || technical.fileSize > 0,
    formatName: technical.format,
    technical,
    fields
  };
}

export function cleanVideoMetadata(buffer: ArrayBufferLike, selectedFieldIds: string[]): Uint8Array {
  // Create an exact clone of the array buffer
  const out = new Uint8Array((buffer as ArrayBuffer).slice(0));
  const view = new DataView(out.buffer);

  const removeAll = selectedFieldIds.includes('all') || selectedFieldIds.length === 0;
  const removeTimestamps = removeAll || selectedFieldIds.includes('creation_time') || selectedFieldIds.includes('modification_time') || selectedFieldIds.includes('track_timestamps');
  const removeUdtaAll = removeAll || selectedFieldIds.includes('udta_all');
  const removeUuid = removeAll || selectedFieldIds.includes('uuid_metadata');

  let offset = 0;
  while (offset + 8 <= out.length) {
    const size = view.getUint32(offset);
    if (size < 8) break;
    const type = String.fromCharCode(
      out[offset + 4], out[offset + 5], out[offset + 6], out[offset + 7]
    );

    if (type === 'moov') {
      const moovEnd = offset + size;
      let childOffset = offset + 8;

      while (childOffset + 8 <= moovEnd) {
        const childSize = view.getUint32(childOffset);
        if (childSize < 8) break;
        const childType = String.fromCharCode(
          out[childOffset + 4], out[childOffset + 5], out[childOffset + 6], out[childOffset + 7]
        );

        if (childType === 'mvhd' && removeTimestamps) {
          const version = view.getUint8(childOffset + 8);
          if (version === 0) {
            view.setUint32(childOffset + 12, 0); // creation_time
            view.setUint32(childOffset + 16, 0); // modification_time
          } else if (version === 1) {
            view.setBigUint64(childOffset + 12, BigInt(0));
            view.setBigUint64(childOffset + 20, BigInt(0));
          }
        }

        if (childType === 'udta') {
          if (removeUdtaAll) {
            // Convert entire udta to 'free' padding box
            out[childOffset + 4] = 0x66; // 'f'
            out[childOffset + 5] = 0x72; // 'r'
            out[childOffset + 6] = 0x65; // 'e'
            out[childOffset + 7] = 0x65; // 'e'
            out.fill(0, childOffset + 8, childOffset + childSize);
          } else {
            // Selective tag scrubbing
            let udtaOffset = childOffset + 8;
            const udtaEnd = childOffset + childSize;

            while (udtaOffset + 8 <= udtaEnd) {
              const uSize = view.getUint32(udtaOffset);
              if (uSize < 8) break;
              const uType = String.fromCharCode(
                out[udtaOffset + 4], out[udtaOffset + 5], out[udtaOffset + 6], out[udtaOffset + 7]
              );

              if (uType === 'meta') {
                let metaOffset = udtaOffset + 12;
                const metaEnd = udtaOffset + uSize;

                while (metaOffset + 8 <= metaEnd) {
                  const mSize = view.getUint32(metaOffset);
                  if (mSize < 8) break;
                  const mType = String.fromCharCode(
                    out[metaOffset + 4], out[metaOffset + 5], out[metaOffset + 6], out[metaOffset + 7]
                  );

                  if (mType === 'ilst') {
                    let ilstOffset = metaOffset + 8;
                    const ilstEnd = metaOffset + mSize;

                    while (ilstOffset + 8 <= ilstEnd) {
                      const iSize = view.getUint32(ilstOffset);
                      if (iSize < 8) break;
                      const iType = String.fromCharCode(
                        out[ilstOffset + 4], out[ilstOffset + 5], out[ilstOffset + 6], out[ilstOffset + 7]
                      );

                      const fieldId = `tag_${iType}`;
                      if (selectedFieldIds.includes(fieldId) || selectedFieldIds.includes('tags_all')) {
                        // Neutralize atom to free box
                        out[ilstOffset + 4] = 0x66;
                        out[ilstOffset + 5] = 0x72;
                        out[ilstOffset + 6] = 0x65;
                        out[ilstOffset + 7] = 0x65;
                        out.fill(0, ilstOffset + 8, ilstOffset + iSize);
                      }

                      ilstOffset += iSize;
                    }
                  }
                  metaOffset += mSize;
                }
              } else if (uType === 'XMP_' && (selectedFieldIds.includes('xmp_packet') || removeAll)) {
                out[udtaOffset + 4] = 0x66;
                out[udtaOffset + 5] = 0x72;
                out[udtaOffset + 6] = 0x65;
                out[udtaOffset + 7] = 0x65;
                out.fill(0, udtaOffset + 8, udtaOffset + uSize);
              } else if ((uType === '©xyz' || uType === 'loc ') && (selectedFieldIds.includes('gps_udta') || removeAll)) {
                out[udtaOffset + 4] = 0x66;
                out[udtaOffset + 5] = 0x72;
                out[udtaOffset + 6] = 0x65;
                out[udtaOffset + 7] = 0x65;
                out.fill(0, udtaOffset + 8, udtaOffset + uSize);
              }

              udtaOffset += uSize;
            }
          }
        }

        if (childType === 'trak') {
          let trakChildOffset = childOffset + 8;
          const trakEnd = childOffset + childSize;

          while (trakChildOffset + 8 <= trakEnd) {
            const tSize = view.getUint32(trakChildOffset);
            if (tSize < 8) break;
            const tType = String.fromCharCode(
              out[trakChildOffset + 4], out[trakChildOffset + 5], out[trakChildOffset + 6], out[trakChildOffset + 7]
            );

            if (tType === 'tkhd' && removeTimestamps) {
              const version = view.getUint8(trakChildOffset + 8);
              if (version === 0) {
                view.setUint32(trakChildOffset + 12, 0);
                view.setUint32(trakChildOffset + 16, 0);
              } else if (version === 1) {
                view.setBigUint64(trakChildOffset + 12, BigInt(0));
                view.setBigUint64(trakChildOffset + 20, BigInt(0));
              }
            }

            if (tType === 'udta' && (removeUdtaAll || removeAll)) {
              out[trakChildOffset + 4] = 0x66;
              out[trakChildOffset + 5] = 0x72;
              out[trakChildOffset + 6] = 0x65;
              out[trakChildOffset + 7] = 0x65;
              out.fill(0, trakChildOffset + 8, trakChildOffset + tSize);
            }

            trakChildOffset += tSize;
          }
        }

        childOffset += childSize;
      }
    }

    if (type === 'uuid' && removeUuid) {
      out[offset + 4] = 0x66;
      out[offset + 5] = 0x72;
      out[offset + 6] = 0x65;
      out[offset + 7] = 0x65;
      out.fill(0, offset + 8, offset + size);
    }

    offset += size;
  }

  return out;
}

export function verifyCleanedMetadata(
  cleanedBuffer: ArrayBufferLike,
  selectedFieldIds: string[]
): VerificationResult {
  const postScan = parseVideoMetadata(cleanedBuffer);
  
  const remainingSelected: DetectedMetadataField[] = [];
  for (const field of postScan.fields) {
    if (selectedFieldIds.includes('all') || selectedFieldIds.includes(field.id)) {
      remainingSelected.push(field);
    }
  }

  const verified = remainingSelected.length === 0;

  return {
    verified,
    remainingSelectedCount: remainingSelected.length,
    remainingFields: remainingSelected,
    message: verified
      ? "Verification Confirmed: All selected metadata fields were successfully eliminated from the video container. Video and audio streams were preserved intact."
      : `Verification Warning: ${remainingSelected.length} metadata field(s) could not be cleared without full re-encoding.`
  };
}
