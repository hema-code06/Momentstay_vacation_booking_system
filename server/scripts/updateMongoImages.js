const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { dbName: 'MomentStay' });
    const db = mongoose.connection.db;

    const mapping = [
      {
        title: 'Aqua Mirage',
        photos: ['/assets/i1.jpg', '/assets/i2.jpg', '/assets/i3.jpg', '/assets/i4.jpg', '/assets/i5.jpg']
      },
      {
        title: 'Ocean Pearl Villa',
        photos: ['/assets/i6.jpg', '/assets/i7.jpg', '/assets/i8.jpg', '/assets/i9.jpg', '/assets/i10.jpg']
      },
      {
        title: 'Moon Yurt',
        photos: ['/assets/i11.jpg', '/assets/i12.jpg', '/assets/i13.jpg', '/assets/i14.jpg', '/assets/i15.jpg', '/assets/yurt.jpeg']
      },
      {
        title: 'Sky Bubble',
        photos: ['/assets/i16.jpg', '/assets/i17.jpg', '/assets/i18.jpeg', '/assets/i19.jpg', '/assets/i20.jpg', '/assets/bt.jpg']
      },
      {
        title: 'Windmill Nest',
        photos: ['/assets/i21.jpg', '/assets/i22.jpg', '/assets/i23.jpg', '/assets/i24.jpg', '/assets/i25.jpg']
      },
      {
        title: 'Lake Bliss',
        photos: ['/assets/i26.jpg', '/assets/i27.jpg', '/assets/i28.jpg', '/assets/i29.jpg', '/assets/i30.jpg']
      },
      {
        title: 'Leaf Loft',
        photos: ['/assets/i31.jpg', '/assets/i32.jpg', '/assets/i33.jpg', '/assets/i34.jpg', '/assets/i35.jpg', '/assets/treehouse.jpg']
      },
      {
        title: 'Tide Cove',
        photos: ['/assets/ob.jpg', '/assets/bh.jpg', '/assets/i1.jpg', '/assets/i6.jpg', '/assets/i11.jpg', '/assets/i26.jpg']
      }
    ];

    for (const item of mapping) {
      const res = await db.collection('listings').updateMany(
        { title: item.title },
        { $set: { listingPhotoPaths: item.photos } }
      );
      console.log('Updated', item.title, res.modifiedCount);
    }

    const userRes = await db.collection('users').updateMany(
      {},
      { $set: { profileImagePath: '/assets/host.png' } }
    );
    console.log('Updated users avatar:', userRes.modifiedCount);

    console.log('Database updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
})();
