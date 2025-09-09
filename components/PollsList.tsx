
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BarChart3 } from "lucide-react";
import { PollWithOptions } from "@/app/types/database";
import { motion } from "framer-motion";

interface PollsListProps {
    polls: PollWithOptions[];
    user: any;
}

export function PollsList({ polls, user }: PollsListProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            <h1 className="text-xl font-bold text-foreground">My Polls</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">
                                {user.email?.split('@')[0]}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Your Polls</h2>
                        <p className="text-muted-foreground">
                            Browse and manage your {polls.length} poll{polls.length !== 1 ? 's' : ''}.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline">Dashboard</Button>
                        </Link>
                        <Link href="/polls/new">
                            <Button>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Create New Poll
                            </Button>
                        </Link>
                    </div>
                </div>

                {polls && polls.length > 0 ? (
                    <motion.div
                        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {polls.map((poll: PollWithOptions) => (
                            <motion.div key={poll.id} variants={itemVariants}>
                                <Link href={`/polls/${poll.id}`}>
                                    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                                        <CardHeader>
                                            <CardTitle className="text-lg line-clamp-2">{poll.question}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>{poll.options?.length || 0} options</span>
                                                <span>
                                                    {new Date(poll.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {poll.description && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                    {poll.description}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
                            <p className="text-muted-foreground mb-6">
                                You haven't created any polls yet. Get started by creating your first poll!
                            </p>
                            <Link href="/polls/new">
                                <Button size="lg">
                                    <PlusCircle className="h-5 w-5 mr-2" />
                                    Create Your First Poll
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
