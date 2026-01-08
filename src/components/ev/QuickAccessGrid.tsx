import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  BarChart3, 
  BookOpen, 
  Image as ImageIcon,
  FileText,
  Users
} from "lucide-react";

interface QuickAccessItem {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    title: "LinkedIn Carousel",
    description: "Gerar carrosséis com IA",
    icon: Sparkles,
    path: "/admin/linkedin-carousel",
    color: "from-blue-500 to-blue-600"
  },
  {
    title: "Campanhas",
    description: "Gerenciar campanhas",
    icon: BarChart3,
    path: "/admin/campaigns",
    color: "from-purple-500 to-purple-600"
  },
  {
    title: "Knowledge Base",
    description: "Base de conhecimento",
    icon: BookOpen,
    path: "/admin/knowledge-base",
    color: "from-green-500 to-green-600"
  },
  {
    title: "Galeria de Produtos",
    description: "Imagens processadas",
    icon: ImageIcon,
    path: "/admin/gallery",
    color: "from-orange-500 to-orange-600"
  },
  {
    title: "Blog",
    description: "Gerenciar posts",
    icon: FileText,
    path: "/admin/blog",
    color: "from-pink-500 to-pink-600"
  },
  {
    title: "Leads",
    description: "Gerenciar contas",
    icon: Users,
    path: "/admin/leads",
    color: "from-cyan-500 to-cyan-600"
  }
];

export function QuickAccessGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {quickAccessItems.map((item) => (
        <Card
          key={item.path}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 group overflow-hidden"
          onClick={() => navigate(item.path)}
        >
          <CardContent className="p-4 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
