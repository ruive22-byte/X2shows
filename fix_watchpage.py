import re

with open('src/components/WatchPage.tsx', 'r') as f:
    content = f.read()

target_search = re.compile(r'\{\/\*\s*Show Poster Card\s*\*\/\}.*?\{\/\*\s*Embedded Iframe as HTML5 Player Fallback\s*\*\/\}', re.DOTALL)

replacement = """{/* Show Poster Card */}
            <div className="group relative aspect-[2/3] max-w-[220px] mx-auto lg:max-w-none rounded-2xl overflow-hidden bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000]">
              <TmdbImage 
                item={show}
                posterPath={show.posterUrl || show.poster_path}
                backdropPath={show.backdropUrl || show.backdrop_path}
                type="poster"
                title={displayTitle}
                name={show.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="hidden lg:block text-sm text-[#99f6e4] leading-relaxed">
              <p className="line-clamp-4">{show.synopsis || show.overview}</p>
            </div>
          </div>
          
          {/* ======================================================================= */}
          {/* RIGHT SIDE: Video Player & Sub-Controls                                */}
          {/* ======================================================================= */}
          <div className={`${isTheaterMode ? 'lg:col-span-10 xl:col-span-10' : 'lg:col-span-10 xl:col-span-10'} space-y-4`}>
            
            <div className="rounded-2xl bg-[#07151e] border-2 border-black shadow-[6px_6px_0px_#000000] overflow-hidden p-1.5 sm:p-2">
              <div 
                className={`relative w-full bg-black rounded-xl overflow-hidden shadow-inner ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}
                style={{ ...combinedFilterStyle }}
              >
                {useIframeEmbed ? (
                  <div className="w-full h-full bg-black">
                    {/* Embed iFrame Stream */}
                    {activeStreamUrl && playbackHealth !== 'blocked' && (
                      <iframe
                        ref={iframeRef}
                        src={streamUrlWithResume}
                        className="w-full h-full border-none"
                        referrerPolicy="origin"
                        allowFullScreen
                        allow="autoplay *; encrypted-media *; picture-in-picture; accelerometer; gyroscope; display-capture"
                        title={`Streaming ${displayTitle}`}
                      />
                    )}
                  </div>
                ) : (
                  /* Interactive HTML5 Player Screen */
                  <div className="relative w-full h-full bg-[#03090d] flex items-center justify-center overflow-hidden">
                    {/* Embedded Iframe as HTML5 Player Fallback */}"""

new_content = target_search.sub(replacement, content, count=1)
if new_content == content:
    print("Replace failed, regex not found.")
else:
    with open('src/components/WatchPage.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully!")
