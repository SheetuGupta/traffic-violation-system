import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.Random;

public class SeedData {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/trafficdb";
        String user = "postgres";
        String password = "sheetu@11229";

        String[] firstNames = {"Amit", "Rahul", "Priya", "Sneha", "Karan", "Vikram", "Anjali", "Neha", "Rohit", "Suresh"};
        String[] lastNames = {"Sharma", "Verma", "Kapoor", "Singh", "Gupta", "Mehta", "Joshi", "Patel", "Reddy", "Nair"};
        String[] locations = {"Connaught Place, Delhi", "Bandra, Mumbai", "MG Road, Bangalore", "Sector 18, Noida", "Cyber Hub, Gurgaon", "Koregaon Park, Pune", "Salt Lake, Kolkata", "Jubilee Hills, Hyderabad", "Marina Beach, Chennai", "Gomti Nagar, Lucknow"};
        String[] violationTypes = {"Speeding", "Red Light Jump", "No Helmet", "Illegal Parking", "Wrong Side Driving", "Using Mobile", "No Seatbelt", "Drunk Driving", "Triple Riding", "Without License"};
        String[] statuses = {"PENDING", "APPROVED", "FINE_ISSUED", "REJECTED"};

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to the database. Seeding data...");
            Random rand = new Random();

            // 1. Insert 10 Users
            String insertUser = "INSERT INTO users (name, email) VALUES (?, ?) RETURNING id";
            long[] userIds = new long[10];
            try (PreparedStatement pstmt = conn.prepareStatement(insertUser)) {
                for (int i = 0; i < 10; i++) {
                    String name = firstNames[rand.nextInt(firstNames.length)] + " " + lastNames[rand.nextInt(lastNames.length)];
                    pstmt.setString(1, name);
                    pstmt.setString(2, "user" + (System.currentTimeMillis() + i) + "@example.com");
                    
                    var rs = pstmt.executeQuery();
                    if (rs.next()) {
                        userIds[i] = rs.getLong(1);
                    }
                }
            }
            System.out.println("Inserted 10 Users.");

            // 2. Insert 50 Violations
            String insertViolation = "INSERT INTO violation (fine_amount, image_url, location, status, vehicle_number, violation_date, violation_type) VALUES (?, ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement pstmt = conn.prepareStatement(insertViolation)) {
                for (int i = 0; i < 50; i++) {
                    String type = violationTypes[rand.nextInt(violationTypes.length)];
                    double fine = (rand.nextInt(10) + 1) * 500.0;
                    
                    String state = new String[]{"DL", "MH", "KA", "UP", "GJ", "TN", "HR"}[rand.nextInt(7)];
                    String vNum = String.format("%s%02d%c%c%04d", state, rand.nextInt(99)+1, (char)(rand.nextInt(26)+'A'), (char)(rand.nextInt(26)+'A'), rand.nextInt(9999)+1);
                    
                    pstmt.setDouble(1, fine);
                    pstmt.setString(2, "http://localhost:8080/uploads/dummy.jpg");
                    pstmt.setString(3, locations[rand.nextInt(locations.length)]);
                    pstmt.setString(4, statuses[rand.nextInt(statuses.length)]);
                    pstmt.setString(5, vNum);
                    pstmt.setTimestamp(6, new Timestamp(System.currentTimeMillis() - rand.nextInt(2000000000)));
                    pstmt.setString(7, type);
                    
                    pstmt.addBatch();
                }
                pstmt.executeBatch();
            }
            System.out.println("Inserted 50 Violations.");
            System.out.println("Data seeding complete!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
