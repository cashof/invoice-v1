import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function ClientsList() {
  return (
    <div>
      <Link href={"/client/createclient"}>
        <Button>
          <Plus /> Add Client
        </Button>
      </Link>
    </div>
  );
}
