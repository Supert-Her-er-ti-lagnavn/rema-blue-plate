import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Package, Tag, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'fridge' | 'shopping' | 'offer';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'fridge',
      title: 'Kjøleskapoppdatering',
      description: 'Marie har lagt til melk og brød i kjøleskapet',
      time: '5 min siden',
      read: false,
    },
    {
      id: '2',
      type: 'shopping',
      title: 'Handleliste fullført',
      description: 'Per har handlet 8 av 10 varer fra handlelisten',
      time: '2 timer siden',
      read: false,
    },
    {
      id: '3',
      type: 'offer',
      title: 'Tilbud på kyllingfilet',
      description: 'Kyllingfilet er på tilbud - 30% rabatt! Passer til dine planlagte måltider.',
      time: '3 timer siden',
      read: false,
    },
    {
      id: '4',
      type: 'fridge',
      title: 'Vare utgår snart',
      description: 'Yoghurt utgår om 2 dager',
      time: '5 timer siden',
      read: true,
    },
    {
      id: '5',
      type: 'offer',
      title: 'Ukens tilbud er her!',
      description: 'Se ukens tilbud på grønnsaker og frukt',
      time: '1 dag siden',
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'fridge':
        return <Package className="text-blue-600" size={20} />;
      case 'shopping':
        return <ShoppingBag className="text-green-600" size={20} />;
      case 'offer':
        return <Tag className="text-orange-600" size={20} />;
      default:
        return <Users className="text-gray-600" size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fridge':
        return 'Kjøleskap';
      case 'shopping':
        return 'Handling';
      case 'offer':
        return 'Tilbud';
      default:
        return 'Annet';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'fridge':
        return 'default';
      case 'shopping':
        return 'secondary';
      case 'offer':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake
        </Button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Varsler</h1>
          <Badge variant="destructive" className="text-sm">
            {notifications.filter(n => !n.read).length} nye
          </Badge>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-all hover:shadow-lg ${
                !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getBadgeVariant(notification.type) as any} className="text-xs">
                      {getTypeLabel(notification.type)}
                    </Badge>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.description}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {notification.time}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ingen varsler
            </h3>
            <p className="text-gray-600">
              Du er oppdatert! Nye varsler vil vises her.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
