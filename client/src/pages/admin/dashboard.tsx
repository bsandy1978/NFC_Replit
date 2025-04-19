import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { 
  Users, 
  CreditCard, 
  Link as LinkIcon, 
  BarChart2, 
  ArrowUpRight,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  const { 
    data: users, 
    isLoading: isLoadingUsers 
  } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { 
    data: cards, 
    isLoading: isLoadingCards 
  } = useQuery({
    queryKey: ["/api/admin/business-cards"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { 
    data: links, 
    isLoading: isLoadingLinks 
  } = useQuery({
    queryKey: ["/api/admin/public-links"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const isLoading = isLoadingUsers || isLoadingCards || isLoadingLinks;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Count active links
  const activeLinks = links?.filter(link => link.isActive) || [];
  
  // Calculate total views
  const totalViews = links?.reduce((acc, link) => acc + link.viewCount, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{users?.length || 0}</div>
              </div>
              <Link href="/admin/users">
                <a className="text-primary hover:text-primary-600 flex items-center">
                  <span className="text-sm">View</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Business Cards Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Business Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{cards?.length || 0}</div>
              </div>
              <Link href="/admin/cards">
                <a className="text-primary hover:text-primary-600 flex items-center">
                  <span className="text-sm">View</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Public Links Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LinkIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{activeLinks?.length || 0}</div>
              </div>
              <Link href="/admin/links">
                <a className="text-primary hover:text-primary-600 flex items-center">
                  <span className="text-sm">View</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Views Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="text-2xl font-bold">{totalViews}</div>
              </div>
              <Link href="/admin/links">
                <a className="text-primary hover:text-primary-600 flex items-center">
                  <span className="text-sm">Details</span>
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Recently registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users && users.length > 0 ? (
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No users found</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Business Cards</CardTitle>
            <CardDescription>
              Recently created business cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cards && cards.length > 0 ? (
              <div className="space-y-4">
                {cards.slice(0, 5).map((card) => (
                  <div key={card.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{card.name || "Untitled Card"}</p>
                      <p className="text-sm text-muted-foreground">{card.jobTitle || "No job title"}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No business cards found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}