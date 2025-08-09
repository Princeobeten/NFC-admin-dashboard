// Script to read all data from Firebase collections
// This is a CommonJS module for Node.js compatibility
require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, collectionGroup } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch all documents from a collection
async function fetchCollection(collectionName) {
  console.log(`\n--- Fetching ${collectionName} collection ---`);
  
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    
    if (snapshot.empty) {
      console.log(`No documents found in ${collectionName} collection.`);
      return [];
    }
    
    const documents = [];
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${documents.length} documents in ${collectionName} collection.`);
    return documents;
  } catch (error) {
    console.error(`Error fetching ${collectionName} collection:`, error);
    return [];
  }
}

// Function to fetch all documents from a subcollection
async function fetchSubcollection(parentCollection, parentId, subcollectionName) {
  console.log(`\n--- Fetching ${parentCollection}/${parentId}/${subcollectionName} subcollection ---`);
  
  try {
    const subcollectionRef = collection(db, parentCollection, parentId, subcollectionName);
    const snapshot = await getDocs(subcollectionRef);
    
    if (snapshot.empty) {
      console.log(`No documents found in ${parentCollection}/${parentId}/${subcollectionName} subcollection.`);
      return [];
    }
    
    const documents = [];
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Found ${documents.length} documents in ${parentCollection}/${parentId}/${subcollectionName} subcollection.`);
    return documents;
  } catch (error) {
    console.error(`Error fetching ${parentCollection}/${parentId}/${subcollectionName} subcollection:`, error);
    return [];
  }
}

// Function to fetch all documents from a collection group (all subcollections with the same name)
async function fetchCollectionGroup(groupName) {
  console.log(`\n--- Fetching all "${groupName}" subcollections across the database ---`);
  
  try {
    const snapshot = await getDocs(collectionGroup(db, groupName));
    
    if (snapshot.empty) {
      console.log(`No documents found in "${groupName}" collection group.`);
      return [];
    }
    
    const documents = [];
    snapshot.forEach(doc => {
      // Get the full path to understand the parent document
      const path = doc.ref.path;
      documents.push({
        id: doc.id,
        path: path,
        ...doc.data()
      });
    });
    
    console.log(`Found ${documents.length} documents in "${groupName}" collection group.`);
    return documents;
  } catch (error) {
    console.error(`Error fetching "${groupName}" collection group:`, error);
    return [];
  }
}

// Main function to read all data
async function readAllData() {
  console.log('Reading all Firebase data...');
  
  // Fetch registration collection (which might contain staff data)
  const registrationData = await fetchCollection('registration');
  console.log('\nRegistration Data Structure:');
  if (registrationData.length > 0) {
    console.log(JSON.stringify(registrationData[0], null, 2));
    console.log(`\nTotal Registration Records: ${registrationData.length}`);
    
    // Print all registration entries
    console.log('\n--- All Registration Entries ---');
    registrationData.forEach(entry => {
      console.log(`${entry.id}: ${entry.name || 'No name'} (${entry.email || 'No email'})`);
    });
  }
  
  // Fetch attendance collection
  const attendanceData = await fetchCollection('attendance');
  console.log('\nAttendance Collection Structure:');
  if (attendanceData.length > 0) {
    console.log(JSON.stringify(attendanceData[0], null, 2));
    console.log(`\nTotal Attendance Documents: ${attendanceData.length}`);
    
    // If there are attendance documents, check for records subcollection in the first one
    if (attendanceData.length > 0) {
      const firstAttendanceId = attendanceData[0].id;
      const records = await fetchSubcollection('attendance', firstAttendanceId, 'records');
      
      if (records.length > 0) {
        console.log('\nAttendance Records Subcollection Structure:');
        console.log(JSON.stringify(records[0], null, 2));
      }
    }
  }
  
  // Fetch all 'records' subcollections across the database
  const allRecords = await fetchCollectionGroup('records');
  console.log('\nAll Records Subcollection Data:');
  if (allRecords.length > 0) {
    console.log(`Total Records across all attendance documents: ${allRecords.length}`);
    console.log('Sample record:');
    console.log(JSON.stringify(allRecords[0], null, 2));
    
    // Print records summary if available
    if (allRecords.length > 0) {
      console.log('\n--- Records Summary ---');
      
      // Count by status if status field exists
      const statusCounts = allRecords.reduce((acc, record) => {
        if (record.status) {
          acc[record.status] = (acc[record.status] || 0) + 1;
        }
        return acc;
      }, {});
      
      if (Object.keys(statusCounts).length > 0) {
        console.log('Status distribution:', statusCounts);
      }
      
      // Try to find date fields
      const dateFields = ['date', 'createdAt', 'timestamp'];
      let dateField = null;
      
      for (const field of dateFields) {
        if (allRecords[0] && (allRecords[0][field] !== undefined)) {
          dateField = field;
          break;
        }
      }
      
      if (dateField) {
        const dates = allRecords
          .map(record => {
            // Handle Firestore timestamps
            if (record[dateField] && typeof record[dateField] === 'object' && record[dateField].toDate) {
              return record[dateField].toDate().toISOString().split('T')[0];
            }
            return record[dateField];
          })
          .filter(date => date); // Filter out undefined dates
          
        if (dates.length > 0) {
          const sortedDates = [...dates].sort();
          console.log(`Date range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
        }
      }
    }
  }
  
  // Check for any other collections that might exist
  try {
    console.log('\n--- Checking for other collections ---');
    const collections = ['staff', 'users', 'employees', 'departments', 'roles'];
    
    for (const collName of collections) {
      if (collName !== 'registration' && collName !== 'attendance') {
        const data = await fetchCollection(collName);
        if (data.length > 0) {
          console.log(`Found ${collName} collection with ${data.length} documents`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking for other collections:', error);
  }
}

// Run the script
readAllData().catch(console.error);
