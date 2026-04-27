package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.Grievance;
import com.civicpulse.civicpulse_backend.model.GrievanceStatus;
import com.civicpulse.civicpulse_backend.repository.GrievanceRepository;
import com.civicpulse.civicpulse_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.io.BufferedReader;
import java.io.InputStreamReader;
@Service
public class ChatbotService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;

    public ChatbotService(GrievanceRepository grievanceRepo,
                          UserRepository userRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
    }

    public Map<String, Object> processMessage(String message, String email) {
        String translatedMessage = translateToEnglish(message);
        String lower = translatedMessage.trim().toLowerCase();
        Map<String, Object> response = new HashMap<>();

        // Intent detection
        if (matchesAny(lower, "hello", "hi", "hey", "good morning", "good evening", "howdy")) {
            response.put("reply", "👋 Hello! I'm CivicBot, your smart city assistant.\n\nI can help you with:\n• Check your complaint status\n• Guide you to submit a new grievance\n• Answer FAQs about categories & process\n• Show your complaint summary\n\nWhat would you like to do?");
            response.put("quickActions", List.of("Check Status", "Submit Complaint", "FAQs", "My Summary"));

        } else if (matchesAny(lower, "status", "track", "check", "my complaint", "my grievance", "what happened", "update")) {
            response.put("reply", getStatusSummary(email));
            response.put("quickActions", List.of("Submit New", "FAQs", "Back to Home"));

        } else if (matchesAny(lower, "submit", "new complaint", "file", "report", "raise", "lodge")) {
            response.put("reply", "📝 **How to Submit a Grievance:**\n\n1. Click **Submit Grievance** in the sidebar\n2. Choose a category (Water, Road, Electricity, etc.)\n3. Enter the location — you can use GPS auto-detect!\n4. Describe your issue in detail\n5. Optionally attach a photo\n6. Click **Submit**\n\nYour complaint will be assigned to the right department automatically.\n\n💡 *Tip: More detail = faster resolution!*");
            response.put("quickActions", List.of("Go to Submit", "Categories Info", "Check Status"));
            response.put("action", "navigate:/citizen/submit");

        } else if (matchesAny(lower, "category", "categories", "type", "types", "what can i report")) {
            response.put("reply", "📋 **Available Complaint Categories:**\n\n🚰 **WATER** — Supply issues, leaks, contamination\n🛣️ **ROAD** — Potholes, damaged roads, traffic signals\n🧹 **SANITATION** — Garbage, sewage, cleanliness\n⚡ **ELECTRICITY** — Power cuts, faulty wiring\n💡 **STREET_LIGHT** — Broken or flickering lights\n📦 **OTHER** — Any other civic issue\n\nChoose the most relevant category when submitting!");
            response.put("quickActions", List.of("Submit Complaint", "Check Status", "FAQs"));

        } else if (matchesAny(lower, "how long", "time", "resolution time", "days", "when will", "how much time")) {
            response.put("reply", "⏱️ **Typical Resolution Times:**\n\n• **Street Lights**: 1-3 days\n• **Water Issues**: 2-5 days\n• **Road Repairs**: 3-7 days\n• **Sanitation**: 1-3 days\n• **Electricity**: 1-3 days\n\nAdmins set SLA deadlines when assigning officers. You'll receive email notifications on every status change!\n\n⚠️ *Overdue complaints are auto-escalated to higher priority.*");
            response.put("quickActions", List.of("Check Status", "Submit Complaint"));

        } else if (matchesAny(lower, "faq", "help", "question", "info", "information", "how does", "how to")) {
            response.put("reply", "❓ **Frequently Asked Questions:**\n\n**Q: How do I track my complaint?**\nA: Go to 'My Grievances' to see all your complaints with live status.\n\n**Q: Can I reopen a resolved complaint?**\nA: Yes! If unsatisfied, click 'Rate & Review' and choose to reopen.\n\n**Q: Who handles my complaint?**\nA: An admin assigns it to the relevant department officer based on category.\n\n**Q: Will I get updates?**\nA: Yes! Email notifications are sent on every status change.\n\n**Q: What if my complaint is urgent?**\nA: Use strong language in your description — our AI auto-flags urgent complaints as HIGH priority.");
            response.put("quickActions", List.of("Categories", "Submit Complaint", "Check Status"));

        } else if (matchesAny(lower, "summary", "stats", "my stats", "overview", "dashboard")) {
            response.put("reply", getMySummary(email));
            response.put("quickActions", List.of("Check Status", "Submit Complaint", "FAQs"));

        } else if (matchesAny(lower, "thank", "thanks", "bye", "goodbye", "see you")) {
            response.put("reply", "🙏 You're welcome! Happy to help. If you need anything else, just type your question.\n\nStay civic! 🏙️");
            response.put("quickActions", List.of("New Question", "Check Status"));

        } else if (matchesAny(lower, "reopen", "unsatisfied", "not resolved", "still broken")) {
            response.put("reply", "🔄 **To Reopen a Complaint:**\n\n1. Go to **My Grievances**\n2. Find the resolved complaint\n3. Click **⭐ Rate & Review**\n4. Select 'Reopen' instead of rating\n\nThe complaint will be sent back to the assigned officer for re-investigation.");
            response.put("quickActions", List.of("My Grievances", "Submit New", "FAQs"));

        } else {
            response.put("reply", "🤔 I'm not sure I understand. Here are some things I can help with:\n\n• **\"Check status\"** — See your complaint updates\n• **\"Submit complaint\"** — File a new grievance\n• **\"Categories\"** — View complaint categories\n• **\"FAQs\"** — Common questions answered\n• **\"My summary\"** — Your complaint overview\n\nTry asking one of these!");
            response.put("quickActions", List.of("Check Status", "Submit Complaint", "FAQs", "My Summary"));
        }

        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    private String getStatusSummary(String email) {
        var userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) return "❌ Could not find your account. Please try again.";

        List<Grievance> grievances = grievanceRepo.findByCitizenId(userOpt.get().getId());
        if (grievances.isEmpty()) {
            return "📭 You haven't submitted any complaints yet.\n\nClick 'Submit Complaint' to file your first grievance!";
        }

        StringBuilder sb = new StringBuilder("📋 **Your Complaint Status:**\n\n");
        // Show last 5
        List<Grievance> recent = grievances.stream()
            .sorted((a, b) -> b.getSubmissionDate().compareTo(a.getSubmissionDate()))
            .limit(5)
            .collect(Collectors.toList());

        for (Grievance g : recent) {
            String emoji = getStatusEmoji(g.getStatus());
            sb.append(String.format("%s **#%d** — %s\n   Status: **%s**\n",
                emoji, g.getId(), g.getTitle(), g.getStatus()));
            if (g.getResolutionNote() != null) {
                sb.append("   Note: ").append(g.getResolutionNote()).append("\n");
            }
            sb.append("\n");
        }

        if (grievances.size() > 5) {
            sb.append("_...and ").append(grievances.size() - 5).append(" more. Visit 'My Grievances' to see all._");
        }

        return sb.toString();
    }

    private String getMySummary(String email) {
        var userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) return "❌ Could not find your account.";

        List<Grievance> grievances = grievanceRepo.findByCitizenId(userOpt.get().getId());
        if (grievances.isEmpty()) {
            return "📭 No complaints filed yet. Submit your first one!";
        }

        long pending = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.PENDING).count();
        long inProgress = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS).count();
        long resolved = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.RESOLVED).count();
        long closed = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.CLOSED).count();
        long reopened = grievances.stream().filter(g -> g.getStatus() == GrievanceStatus.REOPENED).count();

        return String.format(
            "📊 **Your Complaint Summary:**\n\n" +
            "• Total Filed: **%d**\n" +
            "• ⏳ Pending: **%d**\n" +
            "• 🔄 In Progress: **%d**\n" +
            "• ✅ Resolved: **%d**\n" +
            "• 🔒 Closed: **%d**\n" +
            "• 🔁 Reopened: **%d**",
            grievances.size(), pending, inProgress, resolved, closed, reopened
        );
    }

    private String getStatusEmoji(GrievanceStatus status) {
        return switch (status) {
            case PENDING -> "⏳";
            case IN_PROGRESS -> "🔄";
            case RESOLVED -> "✅";
            case CLOSED -> "🔒";
            case REOPENED -> "🔁";
        };
    }

    private boolean matchesAny(String input, String... keywords) {
        for (String keyword : keywords) {
            if (input.contains(keyword)) return true;
        }
        return false;
    }

    private String translateToEnglish(String text) {
        try {
            String encodedText = URLEncoder.encode(text, "UTF-8");
            String urlStr = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=" + encodedText;
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            String inputLine;
            StringBuilder response = new StringBuilder();
            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.toString());
            StringBuilder translated = new StringBuilder();
            if (root.isArray() && root.has(0) && root.get(0).isArray()) {
                for (JsonNode node : root.get(0)) {
                    if (node.has(0)) {
                        translated.append(node.get(0).asText());
                    }
                }
                return translated.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return text;
    }
}
