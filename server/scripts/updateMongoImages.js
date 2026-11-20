const mongoose = require('mongoose');
require('dotenv').config();

// Category-correct image mapping based on data.js experiences:
// Experience 1 (i1-i5)   → Maldives Tropical   → Beachfront  → Tide Cove
// Experience 2 (i6-i10)  → Lake Tahoe Lakeside → Lakefront   → Lake Bliss
// Experience 3 (i11-i15) → Arctic/Iceland       → Arctic/Yurt → Moon Yurt  (yurt.jpeg as hero)
// Experience 4 (i16-i20) → Pool House           → Amazing Pools→ Aqua Mirage
// Experience 5 (i21-i25) → Monaco Luxury        → Luxury      → Ocean Pearl Villa
// Experience 6 (i26-i30) → Windmill/England     → Windmills   → Windmill Nest
// Experience 7 (i31-i35) → Traditional/Thailand → Treehouse   → Leaf Loft
// Sky Bubble (Bubble Tent) → bt.jpg hero + pool images

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: 'MomentStay' });
    const db = mongoose.connection.db;

    const mapping = [
      {
        // Beachfront → Maldives Tropical (i1–i5)
        title: 'Tide Cove',
        photos: [
          '/assets/i1.jpg',
          '/assets/i2.jpg',
          '/assets/i3.jpg',
          '/assets/i4.jpg',
          '/assets/i5.jpg'
        ]
      },
      {
        // Lakefront → Lake Tahoe (i6–i10)
        title: 'Lake Bliss',
        photos: [
          '/assets/i6.jpg',
          '/assets/i7.jpg',
          '/assets/i8.jpg',
          '/assets/i9.jpg',
          '/assets/i10.jpg'
        ]
      },
      {
        // Yurt → Arctic/Iceland feel (i11–i15) + yurt hero
        title: 'Moon Yurt',
        photos: [
          '/assets/yurt.jpeg',
          '/assets/i11.jpg',
          '/assets/i12.jpg',
          '/assets/i13.jpg',
          '/assets/i14.jpg'
        ]
      },
      {
        // Amazing Pools → Pool House Palm Springs (i16–i20)
        title: 'Aqua Mirage',
        photos: [
          '/assets/i16.jpg',
          '/assets/i17.jpg',
          '/assets/i18.jpeg',
          '/assets/i19.jpg',
          '/assets/i20.jpg'
        ]
      },
      {
        // Luxury → Monaco (i21–i25)
        title: 'Ocean Pearl Villa',
        photos: [
          '/assets/i21.jpg',
          '/assets/i22.jpg',
          '/assets/i23.jpg',
          '/assets/i24.jpg',
          '/assets/i25.jpg'
        ]
      },
      {
        // Windmills → English Windmill (i26–i30)
        title: 'Windmill Nest',
        photos: [
          '/assets/i26.jpg',
          '/assets/i27.jpg',
          '/assets/i28.jpg',
          '/assets/i29.jpg',
          '/assets/i30.jpg'
        ]
      },
      {
        // Treehouse → Traditional/Chiang Mai (i31–i35) + treehouse hero
        title: 'Leaf Loft',
        photos: [
          '/assets/treehouse.jpg',
          '/assets/i31.jpg',
          '/assets/i32.jpg',
          '/assets/i33.jpg',
          '/assets/i34.jpg'
        ]
      },
      {
        // Bubble Tent → bt.jpg hero + best pool/tropical supporting images
        title: 'Sky Bubble',
        photos: [
          '/assets/bt.jpg',
          '/assets/i15.jpg',
          '/assets/i35.jpg',
          '/assets/i3.jpg',
          '/assets/i4.jpg'
        ]
      }
    ];

    console.log('Connecting to MongoDB and updating category-matched images...\n');

    for (const item of mapping) {
      const res = await db.collection('listings').updateMany(
        { title: item.title },
        { $set: { listingPhotoPaths: item.photos } }
      );
      console.log(`✅ ${item.title}: ${res.modifiedCount} document(s) updated → [${item.photos[0]}, ...]`);
    }

    // Also fix any listing with S3 URLs still remaining (fallback for any extra listings)
    const s3Fix = await db.collection('listings').updateMany(
      { listingPhotoPaths: { $elemMatch: { $regex: /^https?:\/\// } } },
      [
        {
          $set: {
            listingPhotoPaths: {
              $map: {
                input: '$listingPhotoPaths',
                as: 'photo',
                in: {
                  $cond: {
                    if: { $regexMatch: { input: '$$photo', regex: /^https?:\/\// } },
                    then: '/assets/i1.jpg',
                    else: '$$photo'
                  }
                }
              }
            }
          }
        }
      ]
    );
    if (s3Fix.modifiedCount > 0) {
      console.log(`\n⚠️  Fixed ${s3Fix.modifiedCount} listing(s) that still had S3/HTTP URLs → replaced with /assets/i1.jpg fallback`);
    }

    // Update all user avatars
    const userRes = await db.collection('users').updateMany(
      {},
      { $set: { profileImagePath: '/assets/host.png' } }
    );
    console.log(`\n✅ Updated ${userRes.modifiedCount} user avatar(s) → /assets/host.png`);

    console.log('\n✅ All images realigned to correct categories!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
})();
