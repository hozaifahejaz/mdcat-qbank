import { warm } from "@/lib/cache";
import { getDashboard } from "@/lib/dashboard-data";
import { getPool, warmAttempt, warmCatalog, warmHistory, warmMistakes, warmPools, warmReview } from "@/lib/study";
import { bankById } from "@/lib/banks";

/* A page's numbers, fetched before it opens: when its link is pointed at or touched (components/Nav.tsx), so the page
   opens with them instead of a skeleton. Each fetch is shared with the page itself, so nothing is asked twice. */
export function warmPage(path: string, search = "") {
  const q = new URLSearchParams(search);
  switch (path) {
    case "/dashboard":
    case "/progress":
      warm("dashboard", () => getDashboard(), true);
      warmCatalog("mdcat");
      break;
    case "/practice": {
      // The bank the practice page will open on: the one in the link, else the one used last.
      let last: string | null = null;
      try { last = localStorage.getItem("practice-bank"); } catch {}
      const bank = (bankById(q.get("bank")) ?? (q.get("subject") ? undefined : bankById(last)) ?? bankById("mdcat"))!.id;
      warmCatalog(bank);
      if (q.get("topic")) getPool({ bank, subject: q.get("subject") ?? undefined, topic: q.get("topic")! }).catch(() => {});
      else warmPools(bank);
      break;
    }
    case "/mocks":
    case "/past-papers":
      warmHistory();
      warmCatalog("mdcat");
      break;
    case "/history":
      warmHistory();
      break;
    // A finished test's results, or a saved test to carry on with, by the id in the link.
    case "/review":
      if (q.get("id")) warmReview(q.get("id")!);
      break;
    case "/test":
      if (q.get("id")) warmAttempt(q.get("id")!);
      break;
    case "/mistakes":
      warmMistakes();
      break;
  }
}
