import { PersonaCollection } from './PersonaCollection';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/actions/user';

export async function PersonaCollectionWrapper() {
  let personas: any[] = [];
  
  try {
    const user = await getOrCreateUser();
    if (user) {
      personas = await prisma.persona.findMany({
        where: { challenge: { userId: user.id } },
        include: {
          challenge: {
            include: {
              meals: {
                include: {
                  tags: {
                    include: { tag: true },
                  },
                },
                orderBy: { mealTime: 'desc' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Error fetching personas:', error);
  }

  return <PersonaCollection personas={personas} />;
}

