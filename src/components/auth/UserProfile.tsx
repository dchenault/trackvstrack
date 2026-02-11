
'use client';

import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SignOutButton from './SignOutButton';
import { ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserProfileProps {
  guestNickname?: string | null;
  onChangeNickname?: () => void;
}

export default function UserProfile({
  guestNickname,
  onChangeNickname,
}: UserProfileProps) {
    const { user, loading } = useUser();

    if (loading) {
        return <Skeleton className="h-10 w-24" />;
    }

    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 p-2 rounded-md hover:bg-card transition-colors">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-auto" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <SignOutButton />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    
    if (guestNickname && onChangeNickname) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-2 rounded-md hover:bg-card transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium leading-none">{guestNickname}</p>
                  <p className="text-xs leading-none text-muted-foreground">Guest</p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-auto" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Guest Menu</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onChangeNickname}>
                <span>Change Nickname</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login" className="w-full">Play Your Own Albums</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
    }

    return (
        <Button asChild variant="outline">
            <Link href="/login">Login</Link>
        </Button>
    );
}
