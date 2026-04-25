// This file contains mock functions for all storefront services.
// You can use this as a template to connect your own ecommerce provider.

import type { Options, RequestResult } from '@hey-api/client-fetch';
import { supabase } from './supabase'
import type {
	Collection,
	CreateCustomerData,
	CreateCustomerError,
	CreateCustomerResponse,
	CreateOrderData,
	CreateOrderError,
	CreateOrderResponse,
	GetCollectionByIdData,
	GetCollectionByIdError,
	GetCollectionByIdResponse,
	GetCollectionsData,
	GetCollectionsError,
	GetCollectionsResponse,
	GetOrderByIdData,
	GetOrderByIdError,
	GetOrderByIdResponse,
	GetProductByIdData,
	GetProductByIdError,
	GetProductByIdResponse,
	Order,
	Product,
} from './client.types.ts';

export * from './client.types.ts';

const processImages = (urlPath: string | null, productSlug: string) => {
  const fallbackUrl = '/assets/cat1.jpg';
  
  if (!urlPath) {
    return { 
      main: fallbackUrl, 
      all: [{ id: `${productSlug}-0`, url: fallbackUrl }] 
    };
  }

  const parts = urlPath.split(';').map((part, idx) => {
    const trimmed = part.trim();
    if (!trimmed) return null;

    // Handle Wix IDs vs full URLs
    const url = trimmed.startsWith('http') 
      ? trimmed 
      : `https://static.wixstatic.com/media/`+trimmed;

    return {
      id: `${productSlug}-${idx}`, // ID must be a string
      url: url
    };
  }).filter((item): item is { id: string; url: string } => item !== null);

  return {
    main: parts[0]?.url || fallbackUrl,
    all: parts.length > 0 ? parts : [{ id: `${productSlug}-0`, url: fallbackUrl }]
  };
};


export const getProducts = async (options?: any) => {
  let query = supabase.from('products_clean').select('*');

  // 1. Filter by Collection
  if (options?.query?.collectionId) {
    query = query.contains('collectionids', [options.query.collectionId]);
  }

  // 2. Filter by Specific IDs/Slugs (Critical for Cart & specific lookups)
  if (options?.query?.ids) {
    const ids = Array.isArray(options.query.ids) ? options.query.ids : [options.query.ids];
    query = query.in('slug', ids);
  }

  // 3. Sorting (Handled by Supabase for better performance)
  if (options?.query?.sort === 'price' && options?.query?.order) {
    query = query.order('price', { ascending: options.query.order === 'asc' });
  } else if (options?.query?.sort === 'name' && options?.query?.order) {
    query = query.order('name', { ascending: options.query.order === 'asc' });
  }

  const { data, error } = await query;
  if (error) return asError(error);

  const formattedItems = data?.map(p => {
    const { main, all } = processImages(p.imageurl, p.slug);
    
  const hasVariants = Array.isArray(p.filter_values) && p.filter_values.length > 0 && p.filter_values[0] !== null;

  return {
    ...productDefaults,
    ...p,
    id: p.slug,
    imageUrl: main,
    images: all,
    price: (p.price || 0) * 100,
    collectionIds: p.collectionids || [],
    
    variants: hasVariants
      ? p.filter_values.map((val: string, index: number) => ({
          id: `${p.slug}-${index}`, 
          name: val,
          stock: p.stock ?? 10,
          options: { [p.filter_name || null]: val } 
        }))
      : [{
          ...defaultVariant,
          id: `${p.slug}-default`, // 🚀 MUST include slug to avoid "sample product" bug
          name: 'Default',
          stock: p.stock ?? 1,
          options: {} // 🚀 MUST be empty to show "Add to Cart"
        }],
  };


  });

  return asResult({ items: formattedItems, next: null }) as any;
};


export const getProductById = async <ThrowOnError extends boolean = false>(
  options: Options<GetProductByIdData, ThrowOnError>
): Promise<RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>> => {
  const slug = options.path.id;

  const { data: p, error } = await supabase
    .from('products_clean')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !p) {
    const errorResponse = asError<GetProductByIdError>({ error: 'not-found' });
    if (options.throwOnError) throw errorResponse;
    return errorResponse as any;
  }
  if (slug.includes('flamingo')) {
    console.log("🐱 FELIX DATA:", JSON.stringify(p, null, 2));
  }
  // 1. Logic to check if real variants exist
  // We filter out nulls or empty strings from filter_values
  const hasVariants = Array.isArray(p.filter_values) && p.filter_values.length > 0 && p.filter_values[0] !== null;


  const dynamicVariants = hasVariants
    ? p.filter_values.map((val: string, index: number) => ({
          id: `${p.slug}-${index}`, 
          name: val,
          stock: p.stock ?? 10,
          options: { [p.filter_name || null]: val } 
        }))
      : [{
          ...defaultVariant,
          id: `${p.slug}-default`, // 🚀 MUST include slug to avoid "sample product" bug
          name: 'Default',
          stock: p.stock ?? 1,
          options: {} // 🚀 MUST be empty to show "Add to Cart"
        }];
    const { main, all } = processImages(p.imageurl, p.slug); 
  if (slug.includes('flamingo')) {
    console.log("🐱 FELIX DATA:", JSON.stringify(all, null, 2));
	    console.log("🐱 FELIX DATA:", JSON.stringify(main, null, 2));

  }
  const formattedProduct = {
    ...productDefaults,
    ...p,
    id: p.slug,
    imageUrl: main, // RAW,
images:all,
    price: (p.price || 0) * 100,
    collectionIds: p.collectionids || [],
    variants: dynamicVariants,
  };

  return asResult(formattedProduct as Product) as any;
};




export const getCollections = <ThrowOnError extends boolean = false>(
	_options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
	return asResult({ items: Object.values(collections), next: null });
};

export const getCollectionById = <ThrowOnError extends boolean = false>(
	options: Options<GetCollectionByIdData, ThrowOnError>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
	const collection = collections[options.path.id];
	if (!collection) {
		const error = asError<GetCollectionByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
	}
	return asResult({ ...collection, products: [] });
};


export const createCustomer = <ThrowOnError extends boolean = false>(
	options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	return asResult({
		...options.body,
		id: options.body.id ?? 'customer-1',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	});
};

const orders: Record<string, Order> = {};

export const createOrder = <ThrowOnError extends boolean = false>(
	options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
	if (!options?.body) throw new Error('No body provided');
	const order: Order = {
		...options.body,
		id: 'dk3fd0sak3d',
		number: 1001,
		lineItems: options.body.lineItems.map((lineItem) => ({
			...lineItem,
			id: crypto.randomUUID(),
			productVariant: getProductVariantFromLineItemInput(lineItem.productVariantId),
		})),
		billingAddress: getAddress(options.body.billingAddress),
		shippingAddress: getAddress(options.body.shippingAddress),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	};
	orders[order.id] = order;
	return asResult(order);
};

export const getOrderById = <ThrowOnError extends boolean = false>(
	options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
	const order = orders[options.path.id];
	if (!order) {
		const error = asError<GetOrderByIdError>({ error: 'not-found' });
		if (options.throwOnError) throw error;
		return error as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
	}
	return asResult(order);
};

const collectionDefaults = {
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};



const collections: Record<string, Collection> = {
		dryfood: {
		id: 'dryfood',
		name: 'מזון יבש',
		description: "תזונה מדויקת המבוססת על מחקר — מותאמת לשלב בחיים, גודל הגזע, ומצב הבריאות של הכלב שלך.",
		
		
		slug: 'dryfood',
		emoji: '🥩',
		...collectionDefaults,
	},
			vet: {
		id: 'vet',
		name: 'מזון רפואי',
		description: "תזונה מדויקת המבוססת על מחקר — מותאמת לשלב בחיים, גודל הגזע, ומצב הבריאות של הכלב שלך.",
		slug: 'vet',
		emoji: '🦴',
		...collectionDefaults,
	},
			pestcontrol: {
		id: 'pestcontrol',
		name: 'הדברה',
		description: "תזונה מדויקת המבוססת על מחקר — מותאמת לשלב בחיים, גודל הגזע, ומצב הבריאות של הכלב שלך.",
		slug: 'pestcontrol',
		emoji: '🚀',
		...collectionDefaults,
	},
			toys: {
		id: 'toys',
		name: 'משחקים',
		description: "תזונה מדויקת המבוססת על מחקר — מותאמת לשלב בחיים, גודל הגזע, ומצב הבריאות של הכלב שלך.",
		slug: 'toys',
		emoji: '🎾',
		...collectionDefaults,
	},
			cans: {
		id: 'cans',
		name: 'שימורים ומעדנים',
		description: "תזונה מדויקת המבוססת על מחקר — מותאמת לשלב בחיים, גודל הגזע, ומצב הבריאות של הכלב שלך.",
		slug: 'cans',
		emoji: '🍖',
		...collectionDefaults,
	},
			teeth: {
		id: 'teeth',
		name: 'שיניים',
		description: "תזונה מדויקת המבוססת על מחקר — מותאמת לשלב בחיים, גודל הגזע, ומצב הבריאות של הכלב שלך.",
		slug: 'teeth',
		emoji: '🛁',
		...collectionDefaults,
	},
				leash: {
		id: 'leash',
		name: 'רצועות',
		description: "תזונה מדויקת המבוססת על מחקר — מותאמת לשלב בחיים, גודל הגזע, ומצב הבריאות של הכלב שלך.",
		slug: 'leash',
		emoji: '🦮',
		...collectionDefaults,
	},

};

const defaultVariant = {
	id: 'default',
	name: 'Default',
	stock: 20,
	options: {},
};

const apparelVariants = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size, index) => ({
	id: size,
	name: size,
	stock: index * 10,
	options: {
		Size: size,
	},
}));

const productDefaults = {
	description: '',
	images: [],
	variants: [defaultVariant],
	discount: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	deletedAt: null,
};

const products: Record<string, Product> = {
		'dogli': {
		...productDefaults,
		id: 'dogli',
		name: 'dogli',
		slug: 'dogli',
		tagline:
			'No need to compress this .zip. The Zip Up Hoodie is a comfortable fit and fabric for all sizes.',
		price: 4500,
		imageUrl: '/assets/astro-zip-up-hoodie.png',
		collectionIds: [ 'dryfood', 'dogs'],
				categoryIds: [ 'dryfood', 'dogs'],
cat_dog: ['dogs'],
				tags: [ 'היפואלרגני'],

		variants: apparelVariants,
	},
			'catli': {
		...productDefaults,
		id: 'catli',
		name: 'catli',
		slug: 'catli',
		tagline:
			'No need to compress this .zip. The Zip Up Hoodie is a comfortable fit and fabric for all sizes.',
		price: 4500,
		imageUrl: '/assets/astro-zip-up-hoodie.png',
		collectionIds: [ 'dryfood', 'cats'],
				tags: ['heavy weight', 'היפואלרגני'],
cat_dog: ['cats', 'dpgs'],

		variants: apparelVariants,
	},
	'astro-icon-zip-up-hoodie': {
		...productDefaults,
		id: 'astro-icon-zip-up-hoodie',
		name: 'Astro Icon Zip Up Hoodie',
		slug: 'astro-icon-zip-up-hoodie',
		tagline:
			'No need to compress this .zip. The Zip Up Hoodie is a comfortable fit and fabric for all sizes.',
		price: 4500,
		imageUrl: '/assets/astro-zip-up-hoodie.png',
		collectionIds: ['apparel', 'bestSellers'],
				tags: ['heavy weight', 'היפואלרגני'],

		variants: apparelVariants,
	},
	'astro-logo-curve-bill-snapback-cap': {
		...productDefaults,
		id: 'astro-logo-curve-bill-snapback-cap',
		name: 'Astro Logo Curve Bill Snapback Cap',
		slug: 'astro-logo-curve-bill-snapback-cap',
		tagline: 'The best hat for any occasion, no cap.',
		price: 2500,
		imageUrl: '/assets/astro-cap.png',
		collectionIds: ['apparel'],
						tags: ['heavy weight', 'משחות שיניים'],

	},
	'astro-sticker-sheet': {
		...productDefaults,
		id: 'astro-sticker-sheet',
		name: 'Astro Sticker Sheet',
		slug: 'astro-sticker-sheet',
		tagline: "You probably want this for the fail whale sticker, don't you?",
		price: 1000,
		imageUrl: '/assets/astro-universe-stickers.png',
		collectionIds: ['stickers'],
						tags: ['heavy weight', 'משחות שיניים'],

	},
	'sticker-pack': {
		...productDefaults,
		id: 'sticker-pack',
		name: 'Sticker Pack',
		slug: 'sticker-pack',
		tagline: 'Jam packed with the most popular stickers.',
		price: 500,
		imageUrl: '/assets/astro-sticker-pack.png',
		collectionIds: ['stickers', 'bestSellers'],
						tags: ['heavy weight'],

	},
	'astro-icon-unisex-shirt': {
		...productDefaults,
		id: 'astro-icon-unisex-shirt',
		name: 'Astro Icon Unisex Shirt',
		slug: 'astro-icon-unisex-shirt',
		tagline: 'A comfy Tee with the classic Astro logo.',
		price: 1775,
		imageUrl: '/assets/astro-unisex-tshirt.png',
		collectionIds: ['apparel'],
						tags: ['heavy weight', 'משחות שיניים'],

		variants: apparelVariants,
	},
	'astro-icon-gradient-sticker': {
		...productDefaults,
		id: 'astro-icon-gradient-sticker',
		name: 'Astro Icon Gradient Sticker',
		slug: 'astro-icon-gradient-sticker',
		tagline: "There gradi-ain't a better sticker than the classic Astro logo.",
		price: 200,
		imageUrl: '/assets/astro-icon-sticker.png',
		collectionIds: ['stickers', 'bestSellers'],
						tags: ['heavy weight'],

	},
	'astro-logo-beanie': {
		...productDefaults,
		id: 'astro-logo-beanie',
		name: 'Astro Logo Beanie',
		slug: 'astro-logo-beanie',
		tagline: "There's never Bean a better hat for the winter season.",
		price: 1800,
		imageUrl: '/assets/astro-beanie.png',
		collectionIds: ['apparel', 'bestSellers'],
						tags: ['heavy weight'],

	},
	'lighthouse-100-sticker': {
		...productDefaults,
		id: 'lighthouse-100-sticker',
		name: 'Lighthouse 100 Sticker',
		slug: 'lighthouse-100-sticker',
		tagline: 'Bad performance? Not in my (light) house.',
		price: 500,
		imageUrl: '/assets/astro-lighthouse-sticker.png',
		collectionIds: ['stickers'],
						tags: ['heavy weight'],

	},
	'houston-sticker': {
		...productDefaults,
		id: 'houston-sticker',
		name: 'Houston Sticker',
		slug: 'houston-sticker',
		tagline: 'You can fit a Hous-ton of these on any laptop lid.',
		price: 250,
		discount: 100,
		imageUrl: '/assets/astro-houston-sticker.png',
		collectionIds: ['stickers', 'bestSellers'],
						tags: ['heavy weight'],

	},
};

function asResult<T>(data: T) {
	return Promise.resolve({
		data,
		error: undefined,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function asError<T>(error: T) {
	return Promise.resolve({
		data: undefined,
		error,
		request: new Request('https://example.com'),
		response: new Response(),
	});
}

function getAddress(address: Required<CreateOrderData>['body']['shippingAddress']) {
	return {
		line1: address?.line1 ?? '',
		line2: address?.line2 ?? '',
		city: address?.city ?? '',
		country: address?.country ?? '',
		province: address?.province ?? '',
		postal: address?.postal ?? '',
		phone: address?.phone ?? null,
		company: address?.company ?? null,
		firstName: address?.firstName ?? null,
		lastName: address?.lastName ?? null,
	};
}

function getProductVariantFromLineItemInput(
	variantId: string,
): NonNullable<Order['lineItems']>[number]['productVariant'] {
	for (const product of Object.values(products)) {
		for (const variant of product.variants) {
			if (variant.id === variantId) {
				return { ...variant, product };
			}
		}
	}
	throw new Error(`Product variant ${variantId} not found`);
}
