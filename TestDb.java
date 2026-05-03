import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class TestDb {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/trafficdb";
        String user = "postgres";
        String password = "sheetu@11229";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            System.out.println("--- USERS ---");
            ResultSet rs = stmt.executeQuery("SELECT id, name, email FROM users");
            while (rs.next()) {
                System.out.println("ID: " + rs.getLong("id") + " | Name: " + rs.getString("name") + " | Email: " + rs.getString("email"));
            }

            System.out.println("\n--- VIOLATIONS ---");
            rs = stmt.executeQuery("SELECT id, vehicle_number, violation_type FROM violation");
            while (rs.next()) {
                System.out.println("ID: " + rs.getLong("id") + " | Vehicle: " + rs.getString("vehicle_number") + " | Type: " + rs.getString("violation_type"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
